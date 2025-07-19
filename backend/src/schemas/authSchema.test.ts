// Test file to demonstrate Zod schema usage
// This file can be removed in production

import { 
  registerSchema, 
  loginSchema,
  RegisterInput,
  LoginInput 
} from './authSchema';

// Example function to test register schema validation
export function testRegisterValidation() {
  console.log('🧪 Testing Register Schema Validation');
  
  // Valid data
  const validRegisterData = {
    email: 'user@example.com',
    password: 'SecurePass123',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe'
  };

  try {
    const result = registerSchema.parse(validRegisterData);
    console.log('✅ Valid register data:', result);
  } catch (error) {
    console.log('❌ Register validation failed:', error);
  }

  // Invalid data
  const invalidRegisterData = {
    email: 'invalid-email',
    password: '123', // Too short
    username: 'u!', // Invalid characters and too short
  };

  try {
    registerSchema.parse(invalidRegisterData);
  } catch (error) {
    console.log('❌ Expected validation errors for invalid register data:');
    if (error instanceof Error) {
      console.log(JSON.parse(error.message));
    }
  }
}

// Example function to test login schema validation
export function testLoginValidation() {
  console.log('\n🧪 Testing Login Schema Validation');
  
  // Valid data
  const validLoginData: LoginInput = {
    email: 'user@example.com',
    password: 'any-password'
  };

  try {
    const result = loginSchema.parse(validLoginData);
    console.log('✅ Valid login data:', result);
  } catch (error) {
    console.log('❌ Login validation failed:', error);
  }

  // Invalid data
  const invalidLoginData = {
    email: 'not-an-email',
    password: '', // Empty password
  };

  try {
    loginSchema.parse(invalidLoginData);
  } catch (error) {
    console.log('❌ Expected validation errors for invalid login data:');
    if (error instanceof Error) {
      console.log(JSON.parse(error.message));
    }
  }
}

// Uncomment to run tests
// testRegisterValidation();
// testLoginValidation();
