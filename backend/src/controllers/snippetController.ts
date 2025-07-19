import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { 
  createSnippet as createSnippetService,
  getAllSnippets as getAllSnippetsService,
  getSnippetsWithPagination,
  getSnippetById as getSnippetByIdService,
  updateSnippet as updateSnippetService,
  deleteSnippet as deleteSnippetService,
  getSnippetsByUserId,
  SnippetError
} from '../services/snippetService';
import { 
  createSnippetSchema, 
  updateSnippetSchema,
  listSnippetsSchema,
  snippetIdSchema,
  CreateSnippetInput 
} from '../schemas/snippetSchema';

// Type for authenticated request (user is guaranteed by auth middleware)
interface AuthenticatedRequest extends Request {
  user: {
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
}

/**
 * Create a new snippet
 * @route POST /api/snippets
 * @access Private (requires authentication)
 */
export const createSnippet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod schema
    const validationResult = createSnippetSchema.safeParse(req.body);
    
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

    // Get authenticated user ID from middleware
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        message: 'Usuário não autenticado'
      });
      return;
    }

    const authorId = authReq.user.id;
    const snippetData: CreateSnippetInput = validationResult.data;

    // Call service to create snippet
    const createdSnippet = await createSnippetService(snippetData, authorId);

    // Return success response with 201 status
    res.status(201).json({
      success: true,
      message: 'Snippet criado com sucesso!',
      data: {
        snippet: createdSnippet
      }
    });
  } catch (error) {
    // Handle known snippet errors
    if (error instanceof SnippetError) {
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
    console.error('Create snippet controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao criar snippet'
    });
  }
};

/**
 * Get all public snippets
 * @route GET /api/snippets
 * @access Public
 */
export const getAllSnippets = async (req: Request, res: Response): Promise<void> => {
  try {
    // Call service to get all snippets
    const snippets = await getAllSnippetsService();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Snippets obtidos com sucesso',
      data: {
        snippets,
        count: snippets.length
      }
    });
  } catch (error) {
    // Handle known snippet errors
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    // Handle internal server errors
    console.error('Get all snippets controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar snippets'
    });
  }
};

/**
 * Get snippets with pagination and filtering
 * @route GET /api/snippets/search
 * @access Public (but shows more content if authenticated)
 */
export const getSnippetsWithSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationResult = listSnippetsSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      res.status(400).json({
        success: false,
        error: 'Parâmetros de consulta inválidos',
        details: formattedErrors
      });
      return;
    }

    // Get user ID if authenticated (optional)
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    // Call service with validated query parameters
    const result = await getSnippetsWithPagination(validationResult.data, userId);

    res.status(200).json({
      success: true,
      message: 'Snippets encontrados com sucesso',
      data: result
    });
  } catch (error) {
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Get snippets with search controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar snippets'
    });
  }
};

/**
 * Get snippet by ID
 * @route GET /api/snippets/:id
 * @access Public (but private snippets require ownership)
 */
export const getSnippetById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate snippet ID parameter
    const paramValidation = snippetIdSchema.safeParse(req.params);
    
    if (!paramValidation.success) {
      res.status(400).json({
        success: false,
        error: 'ID do snippet inválido'
      });
      return;
    }

    const { id } = paramValidation.data;
    
    // Get user ID if authenticated (optional for public snippets)
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    // Call service to get snippet
    const snippet = await getSnippetByIdService(id, userId);

    res.status(200).json({
      success: true,
      message: 'Snippet encontrado com sucesso',
      data: {
        snippet
      }
    });
  } catch (error) {
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Get snippet by ID controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar snippet'
    });
  }
};

/**
 * Update snippet by ID
 * @route PUT/PATCH /api/snippets/:id
 * @access Private (only snippet owner)
 */
export const updateSnippet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate snippet ID parameter
    const paramValidation = snippetIdSchema.safeParse(req.params);
    
    if (!paramValidation.success) {
      res.status(400).json({
        success: false,
        error: 'ID do snippet inválido'
      });
      return;
    }

    // Validate request body
    const bodyValidation = updateSnippetSchema.safeParse(req.body);
    
    if (!bodyValidation.success) {
      const formattedErrors = bodyValidation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      res.status(400).json({
        success: false,
        error: 'Dados de entrada inválidos',
        details: formattedErrors
      });
      return;
    }

    // Check authentication
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        message: 'Usuário não autenticado'
      });
      return;
    }

    const { id } = paramValidation.data;
    const updateData = bodyValidation.data;
    const authorId = authReq.user.id;

    // Call service to update snippet
    const updatedSnippet = await updateSnippetService(id, updateData, authorId);

    res.status(200).json({
      success: true,
      message: 'Snippet atualizado com sucesso!',
      data: {
        snippet: updatedSnippet
      }
    });
  } catch (error) {
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Update snippet controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar snippet'
    });
  }
};

/**
 * Delete snippet by ID
 * @route DELETE /api/snippets/:id
 * @access Private (only snippet owner)
 */
export const deleteSnippet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate snippet ID parameter
    const paramValidation = snippetIdSchema.safeParse(req.params);
    
    if (!paramValidation.success) {
      res.status(400).json({
        success: false,
        error: 'ID do snippet inválido'
      });
      return;
    }

    // Check authentication
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        message: 'Usuário não autenticado'
      });
      return;
    }

    const { id } = paramValidation.data;
    const authorId = authReq.user.id;

    // Call service to delete snippet
    const result = await deleteSnippetService(id, authorId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Delete snippet controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar snippet'
    });
  }
};

/**
 * Get snippets by user ID
 * @route GET /api/users/:userId/snippets
 * @access Public (shows only public snippets unless requesting own)
 */
export const getUserSnippets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
      return;
    }

    // Get requester ID if authenticated
    const authReq = req as AuthenticatedRequest;
    const requesterId = authReq.user?.id;

    // Call service to get user's snippets
    const snippets = await getSnippetsByUserId(userId, requesterId);

    res.status(200).json({
      success: true,
      message: 'Snippets do usuário obtidos com sucesso',
      data: {
        snippets,
        count: snippets.length
      }
    });
  } catch (error) {
    if (error instanceof SnippetError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Get user snippets controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar snippets do usuário'
    });
  }
};
