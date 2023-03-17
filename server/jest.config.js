/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './test/init.test.ts',
  rootDir: 'src',
  modulePaths: ['<rootDir>/src'],
  // roots: ['.'],
  // moduleDirectories: ['node_modules', 'src'],
  // moduleNameMapper: {
  //   '(.*)': '<rootDir>/$1',
  // },
};
