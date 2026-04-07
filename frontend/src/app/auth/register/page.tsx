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

const registerSchema = z.object({
  organisationName: z.string().min(2, 'Organisation name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  abn: z
    .string()
    .regex(/^\d{11}$/, 'ABN must be 11 digits')
    .optional()
    .or(z.literal('')),
  ndisRegistrationNo: z.string().optional().or(z.literal('')),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerOrg, registerError, isRegistering, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && isAuthenticated) router.push('/dashboard');
  }, [hydrated, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerOrg({
      ...data,
      abn: data.abn || undefined,
      ndisRegistrationNo: data.ndisRegistrationNo || undefined,
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 text-white p-12 flex-col justify-between">
        <div className="font-mono text-sm tracking-tight">CarePilot</div>
        <div>
          <h1 className="text-4xl font-medium leading-tight mb-4">
            Set up your organisation<br />in under two minutes.
          </h1>
          <p className="text-ink-300 text-sm leading-relaxed max-w-md">
            No credit card. No setup call. You&apos;ll be adding participants and creating your first roster within the hour.
          </p>
          <ul className="mt-8 space-y-2.5 text-sm text-ink-300">
            <li className="flex items-start gap-2.5">
              <span className="text-accent-400 mt-0.5">✓</span>
              <span>30-day free trial, no obligations</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-accent-400 mt-0.5">✓</span>
              <span>Built for Australian NDIS providers</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-accent-400 mt-0.5">✓</span>
              <span>SCHADS-aware rostering and PRODA bulk claims</span>
            </li>
          </ul>
        </div>
        <div className="text-xs text-ink-400 font-mono">v0.1.0 · Brisbane, AU</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden font-mono text-sm tracking-tight text-ink-900 mb-12">
            CarePilot
          </div>

          <h2 className="text-2xl font-medium text-ink-900 mb-1">Get started</h2>
          <p className="text-sm text-ink-500 mb-8">Create your organisation and owner account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field
              label="Organisation name"
              htmlFor="organisationName"
              error={errors.organisationName?.message}
              required
            >
              <Input
                id="organisationName"
                placeholder="Care Solutions Pty Ltd"
                error={!!errors.organisationName}
                {...register('organisationName')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                htmlFor="firstName"
                error={errors.firstName?.message}
                required
              >
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Jane"
                  error={!!errors.firstName}
                  {...register('firstName')}
                />
              </Field>

              <Field
                label="Last name"
                htmlFor="lastName"
                error={errors.lastName?.message}
                required
              >
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Mitchell"
                  error={!!errors.lastName}
                  {...register('lastName')}
                />
              </Field>
            </div>

            <Field label="Work email" htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane@caresolutions.com.au"
                error={!!errors.email}
                {...register('email')}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              hint="At least 8 characters"
              required
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register('password')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="ABN"
                htmlFor="abn"
                error={errors.abn?.message}
                hint="11 digits, optional"
              >
                <Input
                  id="abn"
                  inputMode="numeric"
                  placeholder="12345678901"
                  error={!!errors.abn}
                  {...register('abn')}
                />
              </Field>

              <Field
                label="NDIS reg no."
                htmlFor="ndisRegistrationNo"
                hint="Optional"
              >
                <Input
                  id="ndisRegistrationNo"
                  placeholder="4-ABC-1234"
                  {...register('ndisRegistrationNo')}
                />
              </Field>
            </div>

            {registerError && (
              <div className="text-xs text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {(registerError as any)?.response?.data?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <Button type="submit" loading={isRegistering} className="w-full" size="lg">
              Create account
            </Button>

            <p className="text-xs text-ink-400 text-center pt-2">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100 text-sm text-ink-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-ink-900 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
