import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPath = path.startsWith('/login') || path.startsWith('/auth');
  const isApiPath = path.startsWith('/api');
  const isPublicProfile = path.startsWith('/u/');
  const isMarketing = path === '/' || path.startsWith('/privacy') || path.startsWith('/terms');
  const isPublicPath = isMarketing || isAuthPath || isPublicProfile;

  // If not signed in and trying to access app routes, redirect to login
  if (!user && !isPublicPath && !isApiPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If signed in and on login page, send to platform
  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/platform';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
