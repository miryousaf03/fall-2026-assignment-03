import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../dal/users.js';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  const userIdHeader = req.header('X-User-Id');
  if (!userIdHeader) {
    res.status(401).json({ error: 'Missing X-User-Id header!' });
    return;
  }
  const userId = Number(userIdHeader);
  const user = await getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Bad Request!' });
    return;
  }
  res.locals.userId = user.id;
  next();
}

export default authMiddleware;
