export interface UserPublic {
  id: string;
  username: string;
  email: string;
  hero_id: string | null;
  created_at: Date;
}