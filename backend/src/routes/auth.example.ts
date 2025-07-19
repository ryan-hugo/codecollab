// Example usage of validation schemas in Express routes
// This demonstrates how to integrate Zod schemas with Express middleware

import { Router, Request, Response } from 'express';
import { validateSchema } from '../middleware/validation';
import { 
  registerSchema, 
  loginSchema,
  RegisterInput,
  LoginInput 
} from '../schemas/authSchema';

const router = Router();

// Example register route with validation
router.post('/register', validateSchema(registerSchema), async (req: Request, res: Response) => {
  try {
    // At this point, req.body is guaranteed to match RegisterInput type
    const userData: RegisterInput = req.body;
    
    console.log('Validated user data:', userData);
    
    // Here you would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Create user in database
    // 4. Generate JWT token
    // 5. Return success response
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao registrar usuário'
    });
  }
});

// Example login route with validation
router.post('/login', validateSchema(loginSchema), async (req: Request, res: Response) => {
  try {
    // At this point, req.body is guaranteed to match LoginInput type
    const loginData: LoginInput = req.body;
    
    console.log('Validated login data:', loginData);
    
    // Here you would:
    // 1. Find user by email
    // 2. Compare hashed password
    // 3. Generate JWT token
    // 4. Return success response with token
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        token: 'jwt-token-would-be-here',
        user: {
          email: loginData.email,
          // Other user data...
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer login'
    });
  }
});

// Example of testing validation manually
router.post('/test-validation', async (req: Request, res: Response) => {
  try {
    // Manual validation example
    const validatedData = registerSchema.parse(req.body);
    
    res.json({
      success: true,
      message: 'Dados válidos!',
      data: validatedData
    });
  } catch (error) {
    // Manual error handling
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: error
    });
  }
});

export default router;
