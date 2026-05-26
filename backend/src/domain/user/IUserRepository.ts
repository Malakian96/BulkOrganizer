import { User } from './User';

export interface IUserRepository {
  findByGoogleId(googleId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
