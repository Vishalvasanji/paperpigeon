import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-16">
      <AuthForm mode="signup" />
    </main>
  );
}
