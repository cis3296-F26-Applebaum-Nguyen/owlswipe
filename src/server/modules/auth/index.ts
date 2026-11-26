export type AuthenticatedUser = {
  id: string;
  email: string;
};

export interface AuthService {
  getCurrentUser(): Promise<AuthenticatedUser | null>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<AuthenticatedUser>;
  signOut(): Promise<void>;
}
