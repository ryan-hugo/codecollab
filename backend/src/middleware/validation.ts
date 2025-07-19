import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Middleware factory for validating request data with Zod schemas
export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request body against the schema
      const validatedData = schema.parse(req.body);
      
      // Replace req.body with validated and sanitized data
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Dados de entrada inválidos',
          details: formattedErrors,
        });
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro durante validação dos dados',
      });
    }
  };
};

// Middleware for validating query parameters
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Parâmetros de consulta inválidos',
          details: formattedErrors,
        });
        return;
      }

      console.error('Query validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
};

// Middleware for validating URL parameters
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Parâmetros de URL inválidos',
          details: formattedErrors,
        });
        return;
      }

      console.error('Params validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
};

// Helper function to format Zod errors for consistent API responses
export const formatZodError = (error: ZodError) => {
  return {
    success: false,
    error: 'Dados inválidos',
    details: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      received: (err as any).received,
    })),
  };
};
