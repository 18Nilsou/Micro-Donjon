export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  hero_id: string | null;
}