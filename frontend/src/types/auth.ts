export type UserRole = 'OWNER' | 'ADMIN' | 'COORDINATOR' | 'SUPPORT_WORKER' | 'BILLING';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organisationId: string;
  organisationName: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
