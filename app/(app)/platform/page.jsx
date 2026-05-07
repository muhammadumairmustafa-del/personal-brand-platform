import { createClient } from '@/lib/supabase/server';
import PlatformWrapper from '@/components/PlatformWrapper';

export const dynamic = 'force-dynamic';

export default async function PlatformPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <PlatformWrapper user={{ email: user?.email, id: user?.id }} />;
}
