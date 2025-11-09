/**
 * Manual Test Script for Error Handler
 * Run this to verify error handler functionality
 */

import { ErrorHandler, ErrorType } from '../../services/error-handler';

console.log('=== Testing Error Handler ===\n');

// Test 1: Network Error
console.log('Test 1: Network Error');
const networkError = new Error('Network request failed');
const networkResult = ErrorHandler.handle(networkError);
console.log('Result:', networkResult);
console.log('Should retry:', networkResult.shouldRetry);
console.log('');

// Test 2: Invalid Credentials
console.log('Test 2: Invalid Credentials');
const authError = { message: 'Invalid login credentials' };
const authResult = ErrorHandler.handle(authError);
console.log('Result:', authResult);
console.log('Should retry:', authResult.shouldRetry);
console.log('');

// Test 3: HTTP 404 Error
console.log('Test 3: HTTP 404 Error');
const notFoundError = { response: { status: 404 }, message: 'User not found' };
const notFoundResult = ErrorHandler.handle(notFoundError);
console.log('Result:', notFoundResult);
console.log('Should retry:', notFoundResult.shouldRetry);
console.log('');

// Test 4: HTTP 500 Error
console.log('Test 4: HTTP 500 Error');
const serverError = { response: { status: 500 }, message: 'Internal server error' };
const serverResult = ErrorHandler.handle(serverError);
console.log('Result:', serverResult);
console.log('Should retry:', serverResult.shouldRetry);
console.log('');

// Test 5: Rate Limit Error
console.log('Test 5: Rate Limit Error');
const rateLimitError = { response: { status: 429 }, message: 'Too many requests' };
const rateLimitResult = ErrorHandler.handle(rateLimitError);
console.log('Result:', rateLimitResult);
console.log('Should retry:', rateLimitResult.shouldRetry);
console.log('');

// Test 6: Get Error Type
console.log('Test 6: Get Error Type');
console.log('Network error type:', ErrorHandler.getErrorType(networkError));
console.log('Auth error type:', ErrorHandler.getErrorType(authError));
console.log('404 error type:', ErrorHandler.getErrorType(notFoundError));
console.log('500 error type:', ErrorHandler.getErrorType(serverError));
console.log('');

// Test 7: Get Error Message
console.log('Test 7: Get Error Message');
console.log('Network error message:', ErrorHandler.getErrorMessage(ErrorType.NETWORK_ERROR));
console.log('Invalid credentials message:', ErrorHandler.getErrorMessage(ErrorType.INVALID_CREDENTIALS));
console.log('');

// Test 8: Retry Delay Calculation
console.log('Test 8: Retry Delay Calculation');
console.log('Attempt 1 delay:', ErrorHandler.getRetryDelay(1), 'ms');
console.log('Attempt 2 delay:', ErrorHandler.getRetryDelay(2), 'ms');
console.log('Attempt 3 delay:', ErrorHandler.getRetryDelay(3), 'ms');
console.log('');

// Test 9: Should Retry Logic
console.log('Test 9: Should Retry Logic');
console.log('Network error (attempt 1):', ErrorHandler.shouldRetry(networkError, 1));
console.log('Network error (attempt 3):', ErrorHandler.shouldRetry(networkError, 3));
console.log('Auth error (attempt 1):', ErrorHandler.shouldRetry(authError, 1));
console.log('');

// Test 10: Retry Operation (simulated)
console.log('Test 10: Retry Operation (simulated)');
let attemptCount = 0;
const mockOperation = async () => {
  attemptCount++;
  console.log(`  Attempt ${attemptCount}`);
  if (attemptCount < 2) {
    throw new Error('Network request failed');
  }
  return 'Success!';
};

ErrorHandler.retryOperation(mockOperation)
  .then(result => {
    console.log('  Final result:', result);
    console.log('  Total attempts:', attemptCount);
  })
  .catch(error => {
    console.log('  Failed after retries:', error.message);
  });

console.log('\n=== All Tests Complete ===');
