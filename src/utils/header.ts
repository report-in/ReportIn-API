import { Request } from 'express';

export const getUsername = (req: Request): string => {
  const username = req.headers['username'];
  if (!username || typeof username !== 'string') {
    return 'unknown';
  }
  return username;
};