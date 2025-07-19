import { Router } from 'express';
import { register, login, getProfile, refreshToken, logout } from '../controllers/authController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateSchema } from '../middleware/validation';
import { registerSchema, loginSchema } from '../schemas/authSchema';

// Create Express router instance
const router = Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username: string, email: string, password: string, confirmPassword: string }
 */
router.post(
  '/register',
  validateSchema(registerSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post(
  '/login',
  validateSchema(loginSchema),
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires JWT token)
 * @headers Authorization: Bearer <token>
 */
router.get(
  '/profile',
  authenticateToken,
  getProfile
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token (extend expiration)
 * @access  Private (requires JWT token)
 * @headers Authorization: Bearer <token>
 */
router.post(
  '/refresh',
  authenticateToken,
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (requires JWT token)
 * @headers Authorization: Bearer <token>
 */
router.post(
  '/logout',
  authenticateToken,
  logout
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if token is valid (health check for authentication)
 * @access  Private (requires JWT token)
 * @headers Authorization: Bearer <token>
 */
router.get(
  '/verify',
  authenticateToken,
  (req, res) => {
    const authReq = req as AuthenticatedRequest;
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: authReq.user
      }
    });
  }
);

// Export the router
export default router;
