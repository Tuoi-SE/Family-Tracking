// This type should match the UserRole type in your backend's userModel.ts
export type UserRole = 'admin' | 'user' | 'trackable';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  tracking?: string[];
}
