import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Extended request type for authenticated routes
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 * Adds user data to req.user if token is valid
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Token de acesso necessário',
        message: 'Authorization header não fornecido'
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acesso necessário',
        message: 'Token não fornecido'
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      email: string;
      username: string;
    };

    // Add user info to request object
    (req as AuthenticatedRequest).user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'Token JWT inválido ou malformado'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
        message: 'Token JWT expirado'
      });
      return;
    }

    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro durante autenticação'
    });
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if valid token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      // No valid token format, continue without authentication
      next();
      return;
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, config.jwtSecret as string) as {
        id: string;
        email: string;
        username: string;
      };

      (req as AuthenticatedRequest).user = decoded;
    } catch (tokenError) {
      // Invalid token, but continue without authentication
      console.log('Optional auth - invalid token:', tokenError);
    }
    
    next();
  } catch (error) {
    // Don't block the request for optional auth errors
    console.error('Optional authentication error:', error);
    next();
  }
};
