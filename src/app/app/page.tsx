import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FeedApp } from '@/components/feed-app';

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-6">
      <FeedApp userId={user.id} userEmail={user.email ?? 'unknown'} />
    </main>
  );
}
