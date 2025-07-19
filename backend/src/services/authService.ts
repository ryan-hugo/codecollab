import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { RegisterInput, LoginInput } from '../schemas/authSchema';

const prisma = new PrismaClient();

// Interface for the user data returned (without password)
interface UserResponse {
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
}

// Interface for login response
interface LoginResponse {
  token: string;
  user: UserResponse;
}

// Interface for custom errors
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Register a new user
 * @param userData - Validated user registration data
 * @returns Created user data (without password)
 */
export async function registerUser(userData: RegisterInput): Promise<UserResponse> {
  try {
    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUserByEmail) {
      throw new AuthError('Usuário com este email já existe', 409);
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: userData.username }
    });

    if (existingUserByUsername) {
      throw new AuthError('Nome de usuário já está em uso', 409);
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        points: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Award welcome points and badge
    await Promise.all([
      // Create welcome point transaction
      prisma.pointTransaction.create({
        data: {
          userId: newUser.id,
          amount: 10,
          reason: 'Bônus de boas-vindas ao CodeCollab',
          type: 'BONUS'
        }
      }),

      // Update user points
      prisma.user.update({
        where: { id: newUser.id },
        data: { points: { increment: 10 } }
      }),

      // Award community member badge if it exists
      awardWelcomeBadge(newUser.id)
    ]);

    return newUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    console.error('Error registering user:', error);
    throw new AuthError('Erro interno do servidor ao registrar usuário', 500);
  }
}

/**
 * Authenticate user and generate JWT token
 * @param loginData - Validated login data
 * @returns JWT token and user data
 */
export async function loginUser(loginData: LoginInput): Promise<LoginResponse> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        points: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new AuthError('Credenciais inválidas', 401);
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordValid) {
      throw new AuthError('Credenciais inválidas', 401);
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const signOptions: SignOptions = {
      expiresIn: '1h',
      issuer: 'codecollab-api',
      subject: user.id,
    };
    
    const token = jwt.sign(tokenPayload, config.jwtSecret, signOptions);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    console.error('Error during login:', error);
    throw new AuthError('Erro interno do servidor durante login', 500);
  }
}

/**
 * Verify JWT token and return user data
 * @param token - JWT token
 * @returns User data
 */
export async function verifyToken(token: string): Promise<UserResponse> {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      email: string;
      username: string;
    };

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        points: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new AuthError('Usuário não encontrado', 404);
    }

    return user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Token inválido', 401);
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expirado', 401);
    }

    if (error instanceof AuthError) {
      throw error;
    }

    console.error('Error verifying token:', error);
    throw new AuthError('Erro interno do servidor ao verificar token', 500);
  }
}

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User profile data
 */
export async function getUserProfile(userId: string): Promise<UserResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        points: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new AuthError('Usuário não encontrado', 404);
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    console.error('Error getting user profile:', error);
    throw new AuthError('Erro interno do servidor ao buscar perfil', 500);
  }
}

/**
 * Award welcome badge to new user
 * @param userId - User ID
 */
async function awardWelcomeBadge(userId: string): Promise<void> {
  try {
    // Find the community member badge
    const communityBadge = await prisma.badge.findUnique({
      where: { name: 'Community Member' }
    });

    if (communityBadge) {
      // Check if user already has this badge
      const existingUserBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: communityBadge.id
          }
        }
      });

      if (!existingUserBadge) {
        // Award the badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: communityBadge.id
          }
        });
      }
    }
  } catch (error) {
    // Don't throw error for badge awarding failure
    console.error('Error awarding welcome badge:', error);
  }
}

/**
 * Cleanup: Close database connection
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Export prisma instance for use in other services if needed
export { prisma };
