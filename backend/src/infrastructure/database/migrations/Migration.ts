import type mongoose from 'mongoose';

export interface Migration {
  name: string;
  up(db: mongoose.Connection): Promise<void>;
}
