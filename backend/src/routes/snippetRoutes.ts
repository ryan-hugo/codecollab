import { Router } from 'express';
import { 
  createSnippet, 
  getAllSnippets,
  getSnippetsWithSearch,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  getUserSnippets
} from '../controllers/snippetController';
import { authenticateJWT, optionalAuth } from '../middlewares/authMiddleware';
import { validateSchema } from '../middleware/validation';
import { createSnippetSchema, updateSnippetSchema } from '../schemas/snippetSchema';

// Create Express router instance
const router = Router();

/**
 * Snippet Routes
 * Base path: /api/snippets
 */

/**
 * @route   POST /api/snippets
 * @desc    Create a new snippet
 * @access  Private (requires JWT token)
 * @body    { title: string, description?: string, content: string, language: string, tags?: string[], isPublic?: boolean }
 */
router.post(
  '/',
  authenticateJWT,
  validateSchema(createSnippetSchema),
  createSnippet
);

/**
 * @route   GET /api/snippets
 * @desc    Get all public snippets (simple list)
 * @access  Public
 */
router.get(
  '/',
  getAllSnippets
);

/**
 * @route   GET /api/snippets/search
 * @desc    Get snippets with pagination, filtering, and search
 * @access  Public (but shows more content if authenticated)
 * @query   { page?: number, limit?: number, language?: string, search?: string, tag?: string, author?: string, sortBy?: string, sortOrder?: 'asc'|'desc', isPublic?: boolean }
 */
router.get(
  '/search',
  optionalAuth,
  getSnippetsWithSearch
);

/**
 * @route   GET /api/snippets/:id
 * @desc    Get snippet by ID
 * @access  Public (but private snippets require ownership)
 * @params  { id: string }
 */
router.get(
  '/:id',
  optionalAuth,
  getSnippetById
);

/**
 * @route   PUT /api/snippets/:id
 * @desc    Update snippet by ID (full update)
 * @access  Private (only snippet owner)
 * @params  { id: string }
 * @body    { title?: string, description?: string, content?: string, language?: string, tags?: string[], isPublic?: boolean }
 */
router.put(
  '/:id',
  authenticateJWT,
  validateSchema(updateSnippetSchema),
  updateSnippet
);

/**
 * @route   PATCH /api/snippets/:id
 * @desc    Update snippet by ID (partial update)
 * @access  Private (only snippet owner)
 * @params  { id: string }
 * @body    { title?: string, description?: string, content?: string, language?: string, tags?: string[], isPublic?: boolean }
 */
router.patch(
  '/:id',
  authenticateJWT,
  validateSchema(updateSnippetSchema),
  updateSnippet
);

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Delete snippet by ID
 * @access  Private (only snippet owner)
 * @params  { id: string }
 */
router.delete(
  '/:id',
  authenticateJWT,
  deleteSnippet
);

// Export the router
export default router;
