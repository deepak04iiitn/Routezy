import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN = '30d';

export function signAuthToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  return jwt.verify(token, secret);
}

