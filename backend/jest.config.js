export default {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    // Mongoose requires this to handle its exports correctly with ESM in Jest
    transform: {}, 
  };