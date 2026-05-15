import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB cap per file
const ALLOWED_MIME = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'
]);

export async function POST(request) {
  // Auth gate — only signed-in users can upload
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type. Use PNG, JPG, GIF, WebP, or SVG.` }, { status: 415 });
  }

  // Use the user's authenticated client so RLS enforces ownership of the upload path.
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from('proof')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json(
      { error: 'Upload failed: ' + uploadError.message, hint: 'Make sure you created the "proof" storage bucket in Supabase (see supabase/schema.sql).' },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage.from('proof').getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl, path: filename });
}
