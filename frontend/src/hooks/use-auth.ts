'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth-store';
import type { AuthUser, AuthResponse } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(auth.getUser());
    setHydrated(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>('/auth/login', input);
      return data;
    },
    onSuccess: (data) => {
      auth.setTokens(data.accessToken, data.refreshToken);
      auth.setUser(data.user);
      setUser(data.user);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: {
      organisationName: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      abn?: string;
      ndisRegistrationNo?: string;
    }) => {
      const { data } = await api.post<AuthResponse>('/auth/register', input);
      return data;
    },
    onSuccess: (data) => {
      auth.setTokens(data.accessToken, data.refreshToken);
      auth.setUser(data.user);
      setUser(data.user);
      router.push('/dashboard');
    },
  });

  const logout = () => {
    auth.clear();
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    hydrated,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
