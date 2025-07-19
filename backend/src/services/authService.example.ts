// Example usage of the Authentication Service
// This file demonstrates how to use the authService functions

import { registerUser, loginUser, verifyToken, getUserProfile, AuthError } from './authService';

async function demonstrateAuthService() {
  console.log('🧪 Authentication Service Demo');
  
  try {
    // Example 1: Register a new user
    console.log('\n1. Registering a new user...');
    const newUserData = {
      email: 'demo@codecollab.com',
      password: 'SecurePass123',
      username: 'demouser',
      firstName: 'Demo',
      lastName: 'User'
    };

    const registeredUser = await registerUser(newUserData);
    console.log('✅ User registered successfully:', registeredUser.email);
    console.log('   Points awarded:', registeredUser.points);

    // Example 2: Login with the registered user
    console.log('\n2. Logging in...');
    const loginData = {
      email: 'demo@codecollab.com',
      password: 'SecurePass123'
    };

    const loginResult = await loginUser(loginData);
    console.log('✅ Login successful');
    console.log('   Token generated:', loginResult.token.substring(0, 20) + '...');
    console.log('   User ID:', loginResult.user.id);

    // Example 3: Verify the token
    console.log('\n3. Verifying token...');
    const verifiedUser = await verifyToken(loginResult.token);
    console.log('✅ Token verified for user:', verifiedUser.username);

    // Example 4: Get user profile
    console.log('\n4. Getting user profile...');
    const userProfile = await getUserProfile(verifiedUser.id);
    console.log('✅ Profile retrieved for:', userProfile.email);
    console.log('   User level:', userProfile.level);
    console.log('   Total points:', userProfile.points);

  } catch (error) {
    if (error instanceof AuthError) {
      console.log('❌ Authentication Error:', error.message);
      console.log('   Status Code:', error.statusCode);
    } else {
      console.log('❌ Unexpected Error:', error);
    }
  }
}

async function demonstrateErrorCases() {
  console.log('\n🔴 Error Cases Demo');
  
  try {
    // Example: Try to register with invalid data
    console.log('\n1. Attempting to register with duplicate email...');
    await registerUser({
      email: 'demo@codecollab.com', // Already exists
      password: 'AnotherPass123',
      username: 'newuser'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('❌ Expected error:', error.message, `(${error.statusCode})`);
    }
  }

  try {
    // Example: Try to login with wrong password
    console.log('\n2. Attempting login with wrong password...');
    await loginUser({
      email: 'demo@codecollab.com',
      password: 'WrongPassword'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('❌ Expected error:', error.message, `(${error.statusCode})`);
    }
  }

  try {
    // Example: Try to verify invalid token
    console.log('\n3. Attempting to verify invalid token...');
    await verifyToken('invalid.jwt.token');
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('❌ Expected error:', error.message, `(${error.statusCode})`);
    }
  }
}

// Uncomment to run demonstrations
// demonstrateAuthService();
// demonstrateErrorCases();

export { demonstrateAuthService, demonstrateErrorCases };
