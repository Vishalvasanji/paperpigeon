import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-paper-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Paperpigeon</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Private, simple, shared.</h1>
        <p className="mt-4 text-base text-slate-600">
          A private space for two people to share thoughts that disappear.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Sign up
          </Link>
          <Link href="/login" className="rounded-xl border border-paper-200 px-5 py-2.5 text-sm font-medium hover:bg-paper-100">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
