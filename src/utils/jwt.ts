import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  contactNumber: string;
  name: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      contactNumber: payload.contactNumber,
      name: payload.name,
    },
    secret,
    {
      issuer: process.env.JWT_ISSUER || 'hrnsoft.com',
      audience: process.env.JWT_AUDIENCE || 'blood-bank-api',
      expiresIn: '7d', // Token expires in 7 days
      algorithm: 'HS256',
      
    }
  );

  return token;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload & { iss?: string };
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      contactNumber: decoded.contactNumber,
      name: decoded.name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload & { iss?: string } | null;
    return decoded ? {
      userId: decoded.userId,
      email: decoded.email,
      contactNumber: decoded.contactNumber,
      name: decoded.name,
    } : null;
  } catch (error) {
    return null;
  }
}
