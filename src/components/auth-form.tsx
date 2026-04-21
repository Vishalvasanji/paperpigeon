'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      router.replace('/app');
      router.refresh();
      return;
    }

    const { error: signupError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess('Check your email to confirm your account, then log in.');
      setLoading(false);
      return;
    }

    router.replace('/app');
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-paper-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isLogin ? 'Log in to continue to your private feed.' : 'Sign up to create your private two-person feed.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-paper-200 px-3 py-2 outline-none ring-slate-300 focus:ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-paper-200 px-3 py-2 outline-none ring-slate-300 focus:ring"
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <Link className="font-medium text-slate-900 underline" href={isLogin ? '/signup' : '/login'}>
          {isLogin ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </div>
  );
}
