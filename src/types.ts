export type Role = 'guest' | 'user' | 'bendahara' | 'ketua' | 'superadmin';

export interface User {
  id: string;
  username: string;
  role: Role;
}
