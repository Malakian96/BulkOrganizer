import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../../../infrastructure/config/env';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthController {
  constructor(private readonly userRepo: IUserRepository) {}

  googleSignIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body as { credential?: string };
      if (!credential) {
        res.status(400).json({ error: 'credential is required' });
        return;
      }

      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID,
        });
      } catch {
        res.status(401).json({ error: 'Invalid Google credential' });
        return;
      }

      const payload = ticket.getPayload();
      if (!payload?.sub) {
        res.status(401).json({ error: 'Invalid Google credential' });
        return;
      }

      let user = await this.userRepo.findByGoogleId(payload.sub);
      if (!user) {
        user = User.create({
          googleId:  payload.sub,
          email:     payload.email ?? '',
          name:      payload.name  ?? '',
          avatarUrl: payload.picture ?? undefined,
        });
      } else {
        user.updateProfile({
          name:      payload.name  ?? user.name,
          email:     payload.email ?? user.email,
          avatarUrl: payload.picture,
        });
      }
      await this.userRepo.save(user);

      const token = jwt.sign(
        { sub: user.id, email: user.email, name: user.name },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id:        user.id,
          email:     user.email,
          name:      user.name,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (e) {
      next(e);
    }
  };
}
