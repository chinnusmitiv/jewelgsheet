module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-print$': '<rootDir>/tests/__mocks__/expo-print.js',
    '^expo-sharing$': '<rootDir>/tests/__mocks__/expo-sharing.js',
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.js',
  },
};
