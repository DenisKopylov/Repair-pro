// apps/backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Пути до тестов
  testMatch: ['**/tests/**/*.test.ts'],

  globals: {
    'ts-jest': {
      // Указываем Jest-у, какой tsconfig брать
      tsconfig: '<rootDir>/tsconfig.jest.json'
    }
  },

  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
};

export default config;