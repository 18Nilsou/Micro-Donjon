export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  hero_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  hero_id: string | null;
  created_at: Date;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}
