module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
