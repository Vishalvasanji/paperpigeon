'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { POST_TTL_HOURS } from '@/lib/constants';

type Feed = {
  id: string;
  created_at: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
};

export function FeedApp({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingFeed, setCreatingFeed] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeedAndPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: membership, error: membershipError } = await supabase
      .from('feed_members')
      .select('feed_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      setError(membershipError.message);
      setLoading(false);
      return;
    }

    if (!membership?.feed_id) {
      setFeed(null);
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data: feedData, error: feedError } = await supabase
      .from('feeds')
      .select('id, created_at')
      .eq('id', membership.feed_id)
      .single();

    if (feedError) {
      setError(feedError.message);
      setLoading(false);
      return;
    }

    setFeed(feedData);

    const threshold = new Date(Date.now() - POST_TTL_HOURS * 60 * 60 * 1000).toISOString();

    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at, author_id')
      .eq('feed_id', feedData.id)
      .gt('created_at', threshold)
      .order('created_at', { ascending: false });

    if (postsError) {
      setError(postsError.message);
      setLoading(false);
      return;
    }

    setPosts(postsData ?? []);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    void loadFeedAndPosts();
  }, [loadFeedAndPosts]);

  const createFeed = async () => {
    setCreatingFeed(true);
    setError(null);

    const { data: feedData, error: feedError } = await supabase
      .from('feeds')
      .insert({})
      .select('id, created_at')
      .single();

    if (feedError) {
      setError(feedError.message);
      setCreatingFeed(false);
      return;
    }

    const { error: memberError } = await supabase.from('feed_members').insert({
      feed_id: feedData.id,
      user_id: userId,
    });

    if (memberError) {
      setError(memberError.message);
      setCreatingFeed(false);
      return;
    }

    setFeed(feedData);
    setPosts([]);
    setCreatingFeed(false);
  };

  const createPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = composerValue.trim();
    if (!content || !feed) return;

    setSubmittingPost(true);
    setError(null);

    const { error: postError } = await supabase.from('posts').insert({
      feed_id: feed.id,
      author_id: userId,
      content,
    });

    if (postError) {
      setError(postError.message);
      setSubmittingPost(false);
      return;
    }

    setComposerValue('');
    await loadFeedAndPosts();
    setSubmittingPost(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  if (loading) {
    return <div className="rounded-2xl border border-paper-200 bg-white p-6">Loading your feed…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <header className="flex items-center justify-between rounded-2xl border border-paper-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm text-slate-500">Signed in as {userEmail}</p>
          <h1 className="text-lg font-semibold">Paperpigeon</h1>
        </div>
        <button onClick={signOut} className="rounded-lg border border-paper-200 px-3 py-1.5 text-sm hover:bg-paper-100">
          Sign out
        </button>
      </header>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!feed ? (
        <section className="rounded-2xl border border-paper-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Create your private feed</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your feed is private and designed for exactly two people.
          </p>
          <button
            disabled={creatingFeed}
            onClick={createFeed}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {creatingFeed ? 'Creating…' : 'Create Feed'}
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-paper-200 bg-white p-4">
            <h2 className="font-semibold">Shared Feed</h2>
            <p className="mt-1 text-sm text-slate-600">Share this feed with one other person.</p>
            <p className="mt-2 rounded-lg bg-paper-100 p-2 text-xs text-slate-700">Feed ID: {feed.id}</p>
          </section>

          <section className="rounded-2xl border border-paper-200 bg-white p-4">
            <form onSubmit={createPost} className="space-y-3">
              <label htmlFor="content" className="text-sm font-medium">
                New post
              </label>
              <textarea
                id="content"
                rows={4}
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                className="w-full rounded-xl border border-paper-200 p-3 outline-none ring-slate-300 focus:ring"
                placeholder="Share a thought…"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Posts disappear after {POST_TTL_HOURS} hours.</p>
                <button
                  type="submit"
                  disabled={submittingPost || composerValue.trim().length === 0}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  {submittingPost ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-3">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-paper-200 bg-white p-4 text-sm text-slate-600">
                No posts in the last {POST_TTL_HOURS} hours yet.
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-paper-200 bg-white p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">{post.content}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</p>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
