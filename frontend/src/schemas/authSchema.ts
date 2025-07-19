import { z } from 'zod';

/**
 * Schema de validação para login
 * Deve corresponder ao schema do backend
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

/**
 * Schema de validação para registro
 * Deve corresponder ao schema do backend
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha não pode ter mais de 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username não pode ter mais de 50 caracteres')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username pode conter apenas letras, números, _ e -'
    ),
  firstName: z
    .string()
    .max(50, 'Nome não pode ter mais de 50 caracteres')
    .optional(),
  lastName: z
    .string()
    .max(50, 'Sobrenome não pode ter mais de 50 caracteres')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
