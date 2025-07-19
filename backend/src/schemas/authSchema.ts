import { z } from 'zod';

// Register schema validation
export const registerSchema = z.object({
  email: z
    .string({
      message: 'Email deve ser uma string',
    })
    .min(1, { message: 'Email é obrigatório' })
    .email({
      message: 'Formato de email inválido',
    })
    .max(255, { message: 'Email deve ter no máximo 255 caracteres' })
    .toLowerCase()
    .trim(),

  password: z
    .string({
      message: 'Senha deve ser uma string',
    })
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(128, { message: 'Senha deve ter no máximo 128 caracteres' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    }),

  username: z
    .string({
      message: 'Nome de usuário deve ser uma string',
    })
    .min(3, { message: 'Nome de usuário deve ter no mínimo 3 caracteres' })
    .max(30, { message: 'Nome de usuário deve ter no máximo 30 caracteres' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Nome de usuário pode conter apenas letras, números e underscore',
    })
    .toLowerCase()
    .trim(),

  firstName: z
    .string()
    .min(1, { message: 'Nome não pode estar vazio' })
    .max(50, { message: 'Nome deve ter no máximo 50 caracteres' })
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, { message: 'Sobrenome não pode estar vazio' })
    .max(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' })
    .trim()
    .optional(),
});

// Login schema validation
export const loginSchema = z.object({
  email: z
    .string({
      message: 'Email deve ser uma string',
    })
    .min(1, { message: 'Email é obrigatório' })
    .email({
      message: 'Formato de email inválido',
    })
    .toLowerCase()
    .trim(),

  password: z
    .string({
      message: 'Senha deve ser uma string',
    })
    .min(1, { message: 'Senha é obrigatória' }),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: 'Senha atual é obrigatória' }),

  newPassword: z
    .string()
    .min(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
    .max(128, { message: 'Nova senha deve ter no máximo 128 caracteres' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    }),

  confirmPassword: z
    .string()
    .min(1, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email é obrigatório' })
    .email({
      message: 'Formato de email inválido',
    })
    .toLowerCase()
    .trim(),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Token é obrigatório' }),

  password: z
    .string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(128, { message: 'Senha deve ter no máximo 128 caracteres' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    }),

  confirmPassword: z
    .string()
    .min(1, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'Nome não pode estar vazio' })
    .max(50, { message: 'Nome deve ter no máximo 50 caracteres' })
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, { message: 'Sobrenome não pode estar vazio' })
    .max(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' })
    .trim()
    .optional(),

  bio: z
    .string()
    .max(500, { message: 'Bio deve ter no máximo 500 caracteres' })
    .trim()
    .optional(),

  avatar: z
    .string()
    .url({ message: 'Avatar deve ser uma URL válida' })
    .optional(),
});

// Infer types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Export all schemas for easier importing
export const authSchemas = {
  register: registerSchema,
  login: loginSchema,
  changePassword: changePasswordSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  updateProfile: updateProfileSchema,
} as const;
