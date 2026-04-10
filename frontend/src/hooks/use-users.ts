import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import type { UserRole } from '@/types/user';

export const userKeys = {
  all: ['users'] as const,
  list: (role?: UserRole) => [...userKeys.all, 'list', { role }] as const,
};

export function useUsers(role?: UserRole) {
  return useQuery({
    queryKey: userKeys.list(role),
    queryFn: () => usersApi.getAll({ role }),
    staleTime: 5 * 60_000,
  });
}

export function useSupportWorkers() {
  return useUsers('SUPPORT_WORKER');
}
