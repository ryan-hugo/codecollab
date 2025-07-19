import { Router } from 'express';
import { getUserSnippets } from '../controllers/snippetController';
import { optionalAuth } from '../middlewares/authMiddleware';

// Create Express router instance
const router = Router();

/**
 * User-related Snippet Routes
 * Base path: /api/users
 */

/**
 * @route   GET /api/users/:userId/snippets
 * @desc    Get snippets by specific user ID
 * @access  Public (shows only public snippets unless requesting own)
 * @params  { userId: string }
 */
router.get(
  '/:userId/snippets',
  optionalAuth,
  getUserSnippets
);

// Export the router
export default router;
