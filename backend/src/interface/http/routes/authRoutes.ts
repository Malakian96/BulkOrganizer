import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post('/google', controller.googleSignIn);
  return router;
}
