# Authentication Schema Documentation

This document describes the Zod validation schemas used for authentication in the CodeCollab backend.

## Schemas Overview

### RegisterSchema

Used for validating user registration data.

**Fields:**

- `email`: Required string, valid email format, max 255 chars, lowercased and trimmed
- `password`: Required string, min 6 chars, max 128 chars, must contain lowercase, uppercase, and number
- `username`: Required string, min 3 chars, max 30 chars, alphanumeric + underscore only, lowercased and trimmed
- `firstName`: Optional string, min 1 char, max 50 chars, trimmed
- `lastName`: Optional string, min 1 char, max 50 chars, trimmed

**Example:**

```typescript
const userData = {
  email: "john@example.com",
  password: "SecurePass123",
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
};
```

### LoginSchema

Used for validating user login data.

**Fields:**

- `email`: Required string, valid email format, lowercased and trimmed
- `password`: Required string, min 1 char (any password accepted for login)

**Example:**

```typescript
const loginData = {
  email: "john@example.com",
  password: "user-password",
};
```

## Additional Schemas

### ChangePasswordSchema

For changing user passwords.

**Fields:**

- `currentPassword`: Required string, min 1 char
- `newPassword`: Required string, min 6 chars, with complexity requirements
- `confirmPassword`: Required string, must match newPassword

### ForgotPasswordSchema

For password reset requests.

**Fields:**

- `email`: Required valid email

### ResetPasswordSchema

For completing password resets.

**Fields:**

- `token`: Required string, reset token
- `password`: Required string with complexity requirements
- `confirmPassword`: Required string, must match password

### UpdateProfileSchema

For updating user profile information.

**Fields:**

- `firstName`: Optional string, max 50 chars
- `lastName`: Optional string, max 50 chars
- `bio`: Optional string, max 500 chars
- `avatar`: Optional string, must be valid URL

## Usage Examples

### With Express Middleware

```typescript
import { validateSchema } from "../middleware/validation";
import { registerSchema } from "../schemas/authSchema";

router.post("/register", validateSchema(registerSchema), (req, res) => {
  // req.body is now validated and typed as RegisterInput
  const userData = req.body;
  // ... handle registration
});
```

### Manual Validation

```typescript
import { registerSchema } from "../schemas/authSchema";

try {
  const validData = registerSchema.parse(userData);
  // Data is valid and sanitized
} catch (error) {
  if (error instanceof ZodError) {
    // Handle validation errors
    const errors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
}
```

## Validation Rules

### Password Requirements

- Minimum 6 characters
- Maximum 128 characters
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one number

### Username Requirements

- Minimum 3 characters
- Maximum 30 characters
- Only alphanumeric characters and underscores allowed
- Automatically converted to lowercase

### Email Requirements

- Must be valid email format
- Maximum 255 characters
- Automatically converted to lowercase
- Whitespace trimmed

## Type Safety

All schemas export corresponding TypeScript types:

```typescript
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  // ... other types
} from "../schemas/authSchema";
```

These types ensure type safety throughout your application when working with validated data.
