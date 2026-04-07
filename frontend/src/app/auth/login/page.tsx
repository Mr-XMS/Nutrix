'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loginError, isLoggingIn, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && isAuthenticated) router.push('/dashboard');
  }, [hydrated, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => login(data);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 text-white p-12 flex-col justify-between">
        <div className="font-mono text-sm tracking-tight">CarePilot</div>
        <div>
          <h1 className="text-4xl font-medium leading-tight mb-4">
            NDIS provider operations,<br />without the chaos.
          </h1>
          <p className="text-ink-300 text-sm leading-relaxed max-w-md">
            Rostering, compliance, invoicing, and PRODA bulk claims for small Australian disability service providers.
          </p>
        </div>
        <div className="text-xs text-ink-400 font-mono">v0.1.0 · Brisbane, AU</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden font-mono text-sm tracking-tight text-ink-900 mb-12">
            CarePilot
          </div>

          <h2 className="text-2xl font-medium text-ink-900 mb-1">Sign in</h2>
          <p className="text-sm text-ink-500 mb-8">Welcome back. Enter your details below.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com.au"
                error={!!errors.email}
                {...register('email')}
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register('password')}
              />
            </Field>

            {loginError && (
              <div className="text-xs text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {(loginError as any)?.response?.data?.message || 'Invalid email or password'}
              </div>
            )}

            <Button type="submit" loading={isLoggingIn} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100 text-sm text-ink-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-ink-900 font-medium hover:underline">
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
