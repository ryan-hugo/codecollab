import { PrismaClient } from '@prisma/client';
import { CreateSnippetInput, UpdateSnippetInput, ListSnippetsQuery } from '../schemas/snippetSchema';

// Initialize Prisma client
const prisma = new PrismaClient();

// Custom error class for snippet service
export class SnippetError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SnippetError';
  }
}

/**
 * Create a new snippet
 * @param snippetData - Validated snippet data
 * @param authorId - ID of the user creating the snippet
 * @returns Created snippet with author information
 */
export const createSnippet = async (
  snippetData: CreateSnippetInput, 
  authorId: string
) => {
  try {
    // Verify that the author exists
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, username: true }
    });

    if (!author) {
      throw new SnippetError('Autor não encontrado', 404);
    }

    // Create the snippet
    const createdSnippet = await prisma.snippet.create({
      data: {
        title: snippetData.title,
        description: snippetData.description,
        content: snippetData.content,
        language: snippetData.language,
        tags: snippetData.tags || [],
        isPublic: snippetData.isPublic ?? true,
        authorId: authorId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return createdSnippet;
  } catch (error) {
    if (error instanceof SnippetError) {
      throw error;
    }
    
    console.error('Erro ao criar snippet:', error);
    throw new SnippetError('Erro interno ao criar snippet', 500);
  }
};

/**
 * Get all public snippets with author information
 * @returns Array of snippets with author details
 */
export const getAllSnippets = async () => {
  try {
    const snippets = await prisma.snippet.findMany({
      where: {
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return snippets;
  } catch (error) {
    console.error('Erro ao buscar snippets:', error);
    throw new SnippetError('Erro interno ao buscar snippets', 500);
  }
};

/**
 * Get snippets with pagination and filtering
 * @param query - Query parameters for filtering and pagination
 * @param userId - Optional user ID for filtering user's own private snippets
 * @returns Paginated snippets with metadata
 */
export const getSnippetsWithPagination = async (
  query: ListSnippetsQuery,
  userId?: string
) => {
  try {
    const {
      page = 1,
      limit = 20,
      language,
      search,
      tag,
      author,
      sortBy = 'created',
      sortOrder = 'desc',
      isPublic
    } = query;

    // Build where clause
    const where: any = {};
    
    // Public/private filter
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    } else if (!userId) {
      // If no user is logged in, only show public snippets
      where.isPublic = true;
    } else {
      // If user is logged in, show public snippets and user's own private snippets
      where.OR = [
        { isPublic: true },
        { authorId: userId }
      ];
    }

    // Language filter
    if (language) {
      where.language = language;
    }

    // Author filter
    if (author) {
      where.authorId = author;
    }

    // Tag filter
    if (tag) {
      where.tags = {
        has: tag
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'created':
        orderBy = { createdAt: sortOrder };
        break;
      case 'updated':
        orderBy = { updatedAt: sortOrder };
        break;
      case 'views':
        orderBy = { views: sortOrder };
        break;
      case 'likes':
        orderBy = { likes: sortOrder };
        break;
      case 'title':
        orderBy = { title: sortOrder };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with count
    const [snippets, totalCount] = await Promise.all([
      prisma.snippet.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.snippet.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      snippets,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    };
  } catch (error) {
    console.error('Erro ao buscar snippets com paginação:', error);
    throw new SnippetError('Erro interno ao buscar snippets', 500);
  }
};

/**
 * Get snippet by ID
 * @param snippetId - Snippet ID
 * @param userId - Optional user ID to check ownership for private snippets
 * @returns Snippet with author information
 */
export const getSnippetById = async (snippetId: string, userId?: string) => {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!snippet) {
      throw new SnippetError('Snippet não encontrado', 404);
    }

    // Check if user can access this snippet
    const canAccess = snippet.isPublic || (userId && snippet.authorId === userId);
    
    if (!canAccess) {
      throw new SnippetError('Acesso negado ao snippet', 403);
    }

    // Increment view count if it's not the author viewing
    if (userId !== snippet.authorId) {
      await prisma.snippet.update({
        where: { id: snippetId },
        data: {
          views: {
            increment: 1
          }
        }
      });
      
      snippet.views += 1;
    }

    return snippet;
  } catch (error) {
    if (error instanceof SnippetError) {
      throw error;
    }
    
    console.error('Erro ao buscar snippet:', error);
    throw new SnippetError('Erro interno ao buscar snippet', 500);
  }
};

/**
 * Update snippet by ID
 * @param snippetId - Snippet ID
 * @param updateData - Data to update
 * @param authorId - ID of the user updating the snippet
 * @returns Updated snippet
 */
export const updateSnippet = async (
  snippetId: string,
  updateData: UpdateSnippetInput,
  authorId: string
) => {
  try {
    // Check if snippet exists and user owns it
    const existingSnippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { id: true, authorId: true }
    });

    if (!existingSnippet) {
      throw new SnippetError('Snippet não encontrado', 404);
    }

    if (existingSnippet.authorId !== authorId) {
      throw new SnippetError('Você não tem permissão para editar este snippet', 403);
    }

    // Update the snippet
    const updatedSnippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return updatedSnippet;
  } catch (error) {
    if (error instanceof SnippetError) {
      throw error;
    }
    
    console.error('Erro ao atualizar snippet:', error);
    throw new SnippetError('Erro interno ao atualizar snippet', 500);
  }
};

/**
 * Delete snippet by ID
 * @param snippetId - Snippet ID
 * @param authorId - ID of the user deleting the snippet
 */
export const deleteSnippet = async (snippetId: string, authorId: string) => {
  try {
    // Check if snippet exists and user owns it
    const existingSnippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { id: true, authorId: true }
    });

    if (!existingSnippet) {
      throw new SnippetError('Snippet não encontrado', 404);
    }

    if (existingSnippet.authorId !== authorId) {
      throw new SnippetError('Você não tem permissão para deletar este snippet', 403);
    }

    // Delete the snippet (cascading delete will handle reviews)
    await prisma.snippet.delete({
      where: { id: snippetId }
    });

    return { message: 'Snippet deletado com sucesso' };
  } catch (error) {
    if (error instanceof SnippetError) {
      throw error;
    }
    
    console.error('Erro ao deletar snippet:', error);
    throw new SnippetError('Erro interno ao deletar snippet', 500);
  }
};

/**
 * Get snippets by user ID
 * @param userId - User ID
 * @param requesterId - ID of the user making the request (to check for private snippets)
 * @returns User's snippets
 */
export const getSnippetsByUserId = async (userId: string, requesterId?: string) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });

    if (!user) {
      throw new SnippetError('Usuário não encontrado', 404);
    }

    // Build where clause - show public snippets, and private ones if it's the same user
    const where: any = {
      authorId: userId
    };

    if (requesterId !== userId) {
      where.isPublic = true;
    }

    const snippets = await prisma.snippet.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return snippets;
  } catch (error) {
    if (error instanceof SnippetError) {
      throw error;
    }
    
    console.error('Erro ao buscar snippets do usuário:', error);
    throw new SnippetError('Erro interno ao buscar snippets do usuário', 500);
  }
};
