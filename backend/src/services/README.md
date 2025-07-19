# Authentication Service Documentation

This document describes the authentication service and API endpoints for the CodeCollab backend.

## Service Functions

### registerUser(userData: RegisterInput): Promise<UserResponse>

Registers a new user in the system.

**Features:**

- Validates unique email and username
- Hashes password with bcrypt (12 salt rounds)
- Awards welcome bonus (10 points)
- Awards community member badge
- Returns user data without password

**Errors:**

- 409: Email or username already exists
- 500: Internal server error

### loginUser(loginData: LoginInput): Promise<LoginResponse>

Authenticates user and generates JWT token.

**Features:**

- Validates email and password
- Compares password with bcrypt
- Generates JWT with 1h expiration (configurable)
- Returns token and user data

**Errors:**

- 401: Invalid credentials
- 500: Internal server error

### verifyToken(token: string): Promise<UserResponse>

Verifies JWT token and returns user data.

**Features:**

- Validates JWT signature and expiration
- Returns current user data from database

**Errors:**

- 401: Invalid or expired token
- 404: User not found
- 500: Internal server error

### getUserProfile(userId: string): Promise<UserResponse>

Gets user profile by ID.

**Features:**

- Returns complete user profile (without password)

**Errors:**

- 404: User not found
- 500: Internal server error

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso!",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "bio": null,
      "points": 10,
      "level": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/auth/login

Login user and get JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe"
      // ... other user fields
    }
  }
}
```

### GET /api/auth/profile

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Perfil do usuário obtido com sucesso",
  "data": {
    "user": {
      // Complete user profile
    }
  }
}
```

### POST /api/auth/refresh

Refresh JWT token (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "data": {
    "token": "new_jwt_token_here",
    "user": {
      // Updated user profile
    }
  }
}
```

### POST /api/auth/logout

Logout user (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout realizado com sucesso",
  "data": {
    "message": "Token deve ser removido do cliente"
  }
}
```

### GET /api/auth/verify

Verify if JWT token is valid (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe"
    }
  }
}
```

## Authentication Middleware

### authenticateToken

Protects routes requiring authentication. Extracts JWT from Authorization header and validates it.

**Usage:**

```typescript
router.get("/protected", authenticateToken, controller);
```

**Features:**

- Supports "Bearer <token>" format
- Validates JWT signature and expiration
- Adds user data to req.user
- Returns 401 for invalid/missing tokens

### optionalAuth

Optional authentication for routes that can work with or without authentication.

**Usage:**

```typescript
router.get("/optional", optionalAuth, controller);
```

**Features:**

- Sets req.user if valid token provided
- Continues execution even without token
- Doesn't block request for invalid tokens

## Security Features

### Password Security

- bcrypt hashing with 12 salt rounds
- Minimum 6 characters with complexity requirements
- Passwords never returned in API responses

### JWT Security

- Configurable secret key (JWT_SECRET environment variable)
- Configurable expiration time (JWT_EXPIRES_IN environment variable)
- Includes issuer and subject claims
- Proper error handling for invalid/expired tokens

### Validation

- Input validation with Zod schemas
- SQL injection prevention with Prisma
- CORS configuration for frontend communication
- Rate limiting ready (can be implemented)

## Error Handling

All authentication functions use the custom `AuthError` class with appropriate HTTP status codes:

- 400: Bad request (validation errors)
- 401: Unauthorized (invalid credentials, expired tokens)
- 404: Not found (user doesn't exist)
- 409: Conflict (email/username already exists)
- 500: Internal server error

Errors are consistently formatted:

```json
{
  "success": false,
  "error": "Error message in Portuguese",
  "details": "Additional error details if available"
}
```
