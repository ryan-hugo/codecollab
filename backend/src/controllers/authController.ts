import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { registerUser, loginUser, getUserProfile, AuthError } from '../services/authService';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../schemas/authSchema';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod schema
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      // Handle Zod validation errors
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));

      res.status(400).json({
        success: false,
        error: 'Dados de entrada inválidos',
        message: 'Verifique os campos obrigatórios e tente novamente',
        details: formattedErrors
      });
      return;
    }

    // Use validated data
    const userData: RegisterInput = validationResult.data;
    
    // Call auth service to register user
    const newUser = await registerUser(userData);
    
    // Return success response with 201 status
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    // Handle known authentication errors
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    // Handle unexpected Zod errors (fallback)
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: formattedErrors
      });
      return;
    }

    // Handle internal server errors
    console.error('Register controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao registrar usuário'
    });
  }
};

/**
 * Login user and return JWT token
 * @route POST /api/auth/login  
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod schema
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      // Handle Zod validation errors
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));

      res.status(400).json({
        success: false,
        error: 'Dados de entrada inválidos',
        message: 'Email e senha são obrigatórios',
        details: formattedErrors
      });
      return;
    }

    // Use validated data
    const loginData: LoginInput = validationResult.data;
    
    // Call auth service to authenticate user
    const result = await loginUser(loginData);
    
    // Return success response with 200 status
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: result
    });
  } catch (error) {
    // Handle known authentication errors
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    // Handle unexpected Zod errors (fallback)
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: formattedErrors
      });
      return;
    }

    // Handle internal server errors
    console.error('Login controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer login'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    const userProfile = await getUserProfile(authReq.user.id);
    
    res.json({
      success: true,
      message: 'Perfil do usuário obtido com sucesso',
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Get profile controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao obter perfil do usuário'
    });
  }
};

/**
 * Refresh token (extend expiration)
 * @route POST /api/auth/refresh
 * @access Private
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    // Get user profile to generate new token
    const userProfile = await getUserProfile(authReq.user.id);
    
    // Generate new token with same payload but fresh expiration
    const jwt = require('jsonwebtoken');
    const { config } = require('../config');
    
    const tokenPayload = {
      id: userProfile.id,
      email: userProfile.email,
      username: userProfile.username,
    };

    const token = jwt.sign(
      tokenPayload,
      config.jwtSecret,
      { 
        expiresIn: config.jwtExpiresIn,
        issuer: 'codecollab-api',
        subject: userProfile.id,
      }
    );
    
    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token,
        user: userProfile
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Refresh token controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao renovar token'
    });
  }
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // JWT tokens are stateless, so logout is handled client-side by removing the token
    // Here we just confirm the logout action
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      data: {
        message: 'Token deve ser removido do cliente'
      }
    });
  } catch (error) {
    console.error('Logout controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro durante logout'
    });
  }
};
