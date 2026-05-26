import { User } from '../../domain/user/User';
import { IUserRepository } from '../../domain/user/IUserRepository';
import { UserModel } from './UserDocument';

export class MongoUserRepository implements IUserRepository {
  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId }).lean().exec();
    if (!doc) return null;
    return User.reconstitute({
      id:        doc._id,
      googleId:  doc.googleId,
      email:     doc.email,
      name:      doc.name,
      avatarUrl: doc.avatarUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id,
      {
        $set: {
          googleId:  user.googleId,
          email:     user.email,
          name:      user.name,
          avatarUrl: user.avatarUrl,
          updatedAt: user.updatedAt,
        },
        $setOnInsert: {
          _id:       user.id,
          createdAt: user.createdAt,
        },
      },
      { upsert: true, new: true }
    ).exec();
  }
}
