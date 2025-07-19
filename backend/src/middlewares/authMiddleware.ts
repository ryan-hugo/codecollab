import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Initialize Prisma client
const prisma = new PrismaClient();

// User type (will be properly typed once Prisma generates client)
type UserType = {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  points: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
};

// JWT Strategy options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
  issuer: 'codecollab-api',
  algorithms: ['HS256']
};

// JWT Strategy implementation
passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Extract user ID from JWT payload
      const userId = jwtPayload.id || jwtPayload.sub;
      
      if (!userId) {
        return done(null, false, { message: 'Token inválido: ID do usuário não encontrado' });
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          bio: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          location: true,
          isEmailVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password and other sensitive fields
        }
      });

      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      // Check if user account is active (not deleted/banned)
      // You can add additional checks here if needed
      
      return done(null, user);
    } catch (error) {
      console.error('Erro na estratégia JWT:', error);
      return done(error, false);
    }
  })
);

/**
 * Middleware to authenticate requests using Passport JWT strategy
 * Extracts JWT from Authorization header and validates user
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: UserType | false, info: any) => {
    // Handle authentication errors
    if (err) {
      console.error('Erro de autenticação:', err);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro durante autenticação'
      });
      return;
    }

    // Handle invalid or missing token
    if (!user) {
      const message = info?.message || 'Token inválido ou expirado';
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        message: message
      });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Optional middleware for routes that can work with or without authentication
 * If token is provided and valid, user will be attached to req.user
 * If no token or invalid token, continues without user (no error thrown)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  // If no Authorization header, continue without authentication
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  // Try to authenticate, but don't fail if token is invalid
  passport.authenticate('jwt', { session: false }, (err: any, user: UserType | false) => {
    if (err) {
      console.error('Erro na autenticação opcional:', err);
    }
    
    // Attach user if authentication was successful, otherwise continue without user
    if (user) {
      req.user = user;
    }
    
    next();
  })(req, res, next);
};

/**
 * Middleware to check if user owns the resource
 * Useful for protecting user-specific resources
 */
export const requireOwnership = (getUserIdFromParams: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as UserType;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        message: 'Usuário não autenticado'
      });
      return;
    }

    const resourceUserId = getUserIdFromParams(req);
    const isOwner = user.id === resourceUserId;

    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado',
        message: 'Você só pode acessar seus próprios recursos'
      });
      return;
    }

    next();
  };
};

// Initialize Passport
export const initializePassport = () => {
  return passport.initialize();
};

// Export passport instance for use in app.ts
export { passport };

// Export types for use in other modules
export interface AuthenticatedRequest extends Request {
  user: UserType;
}
