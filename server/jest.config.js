/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./test/jest.init.ts'],
  rootDir: 'src',
  modulePaths: ['<rootDir>'],
};
