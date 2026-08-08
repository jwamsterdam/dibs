/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
    // MSW and its dependencies ship ESM (.mjs) — transform them too.
    '^.+\\.(mjs|cjs)$': ['@swc/jest', { jsc: { parser: { syntax: 'ecmascript' } } }],
  },
  // Do NOT ignore MSW's ESM dependency tree (default ignores all node_modules).
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|rettime|until-async|strict-event-emitter|headers-polyfill|outvariant|is-node-process|@open-draft|graphql|tough-cookie|set-cookie-parser)/)',
  ],
  // Coverage covers shared/ + feature slices. Bootstrap, generated, i18n config,
  // stories, and dev/test infra are excluded (exercised via integration, not unit).
  collectCoverageFrom: [
    'src/shared/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/**/*.d.ts',
    '!src/shared/i18n/**',
    '!src/shared/lib/msw/**',
    '!src/shared/test/**',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 75, functions: 85, lines: 80 },
  },
};
