const path = require('path');
const nodeModulesToTransform = (moduleNames: string[]) =>
  `node_modules\/(?!.*(${moduleNames.join('|')})\/.*)`;

// Array of known package dependencies that only bundle an ESM version
const ESModules = [
  '.pnpm', // Support using pnpm symlinked packages
  'd3',
  'd3-.*',
  'internmap',
  'delaunator',
  'robust-predicates',
  'rxjs',
  'uuid',
];

module.exports = {
  modulePaths: ['./src'],
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['./jest-setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/tests/*.{test,jest}.{js,ts}'],
  coverageDirectory: 'coverage/jest',
  testEnvironmentOptions: {
    url: 'https://localhost/?mockedQueryString=true&Another=2',
  },
  watchPathIgnorePatterns: [
    '/node_modules/', // Ignore changes in node_modules directory
    '/dist/', // Ignore changes in the dist directory
    '/coverage/',
  ],
  // Jest will throw `Cannot use import statement outside module` if it tries to load an
  // ES module without it being transformed first.
  transformIgnorePatterns: [nodeModulesToTransform(ESModules)],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: false,
            dynamicImport: true,
          },
        },
      },
    ],
  },
};
