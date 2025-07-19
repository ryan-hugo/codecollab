import { z } from 'zod';

// Supported programming languages for snippets
const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'c',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'dart',
  'html',
  'css',
  'scss',
  'sass',
  'sql',
  'json',
  'xml',
  'yaml',
  'markdown',
  'bash',
  'shell',
  'powershell',
  'dockerfile',
  'other'
] as const;

// Create snippet schema for validation
export const createSnippetSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório')
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => val === '' ? undefined : val)
    .refine(
      (val) => val === undefined || val.length >= 10,
      'A descrição deve ter pelo menos 10 caracteres se fornecida'
    )
    .refine(
      (val) => val === undefined || val.length <= 1000,
      'A descrição deve ter no máximo 1000 caracteres'
    ),
  
  content: z
    .string()
    .trim()
    .min(1, 'O código é obrigatório')
    .min(5, 'O código deve ter pelo menos 5 caracteres')
    .max(50000, 'O código deve ter no máximo 50.000 caracteres'),
  
  language: z
    .enum(SUPPORTED_LANGUAGES, {
      message: 'Linguagem de programação inválida'
    }),
  
  tags: z
    .array(
      z.string()
        .trim()
        .min(1, 'Tag não pode estar vazia')
        .max(30, 'Tag deve ter no máximo 30 caracteres')
        .regex(/^[a-zA-Z0-9\-_]+$/, 'Tag deve conter apenas letras, números, hífens e underscores')
    )
    .optional()
    .default([])
    .transform((tags) => tags.slice(0, 10)) // Limit to 10 tags
    .refine(
      (tags) => new Set(tags).size === tags.length,
      'Tags duplicadas não são permitidas'
    ),
  
  isPublic: z
    .boolean()
    .optional()
    .default(true)
});

// Update snippet schema (allows partial updates)
export const updateSnippetSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres')
    .optional(),
  
  description: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => val === '' ? null : val)
    .refine(
      (val) => val === null || val === undefined || val.length >= 10,
      'A descrição deve ter pelo menos 10 caracteres se fornecida'
    )
    .refine(
      (val) => val === null || val === undefined || val.length <= 1000,
      'A descrição deve ter no máximo 1000 caracteres'
    ),
  
  content: z
    .string()
    .trim()
    .min(5, 'O código deve ter pelo menos 5 caracteres')
    .max(50000, 'O código deve ter no máximo 50.000 caracteres')
    .optional(),
  
  language: z
    .enum(SUPPORTED_LANGUAGES, {
      message: 'Linguagem de programação inválida'
    })
    .optional(),
  
  tags: z
    .array(
      z.string()
        .trim()
        .min(1, 'Tag não pode estar vazia')
        .max(30, 'Tag deve ter no máximo 30 caracteres')
        .regex(/^[a-zA-Z0-9\-_]+$/, 'Tag deve conter apenas letras, números, hífens e underscores')
    )
    .optional()
    .transform((tags) => tags ? tags.slice(0, 10) : undefined) // Limit to 10 tags
    .refine(
      (tags) => !tags || new Set(tags).size === tags.length,
      'Tags duplicadas não são permitidas'
    ),
  
  isPublic: z
    .boolean()
    .optional()
});

// Query parameters schema for listing snippets
export const listSnippetsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Página deve ser um número positivo'),
  
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limite deve ser entre 1 e 100'),
  
  language: z
    .enum(SUPPORTED_LANGUAGES)
    .optional(),
  
  search: z
    .string()
    .trim()
    .min(1, 'Termo de busca deve ter pelo menos 1 caracter')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres')
    .optional(),
  
  tag: z
    .string()
    .trim()
    .min(1, 'Tag deve ter pelo menos 1 caracter')
    .max(30, 'Tag deve ter no máximo 30 caracteres')
    .optional(),
  
  author: z
    .string()
    .trim()
    .min(1, 'ID do autor é obrigatório')
    .optional(),
  
  sortBy: z
    .enum(['created', 'updated', 'views', 'likes', 'title'])
    .optional()
    .default('created'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Snippet ID parameter schema
export const snippetIdSchema = z.object({
  id: z
    .string()
    .min(1, 'ID do snippet é obrigatório')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID do snippet inválido')
});

// Export inferred types for use in controllers and services
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type ListSnippetsQuery = z.infer<typeof listSnippetsSchema>;
export type SnippetIdParams = z.infer<typeof snippetIdSchema>;

// Export supported languages for use in other modules
export { SUPPORTED_LANGUAGES };
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
