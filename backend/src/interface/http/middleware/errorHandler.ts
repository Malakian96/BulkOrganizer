import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/shared/DomainError';
import { ApplicationError } from '../../../application/shared/ApplicationError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError || err instanceof ApplicationError) {
    res.status(422).json({ error: err.message });
    return;
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
