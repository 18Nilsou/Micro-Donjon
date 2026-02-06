import { UserPublic} from './UserPublic';


export interface AuthResponse {
  user: UserPublic;
  token: string;
}