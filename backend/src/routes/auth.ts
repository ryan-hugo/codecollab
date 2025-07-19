import { Router } from 'express';
import { validateSchema } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { registerSchema, loginSchema } from '../schemas/authSchema';
import { register, login, getProfile, refreshToken, logout } from '../controllers/authController';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validateSchema(registerSchema),
  register
);

/**
 * @route POST /api/auth/login
 * @desc Login user and get JWT token
 * @access Public
 */
router.post(
  '/login',
  validateSchema(loginSchema),
  login
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticateJWT,
  getProfile
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post(
  '/refresh',
  authenticateJWT,
  refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Private
 */
router.post(
  '/logout',
  authenticateJWT,
  logout
);

/**
 * @route GET /api/auth/verify
 * @desc Verify if token is valid (health check for authentication)
 * @access Private
 */
router.get(
  '/verify',
  authenticateJWT,
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

export default router;
