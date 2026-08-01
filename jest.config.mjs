import nextJest from "next/jest.js";

// Point next/jest at the app root so it can load next.config + .env files.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  // jsdom gives us a fake browser (document, window) so React component
  // tests work. Pure-logic tests in src/lib don't need it but don't mind it.
  testEnvironment: "jsdom",

  // Runs before every test file — see jest.setup.ts.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Let us import with the same "@/..." alias the app uses.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Collect coverage from real source only, not tests or type-only files.
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "!src/lib/types.ts",
    "!src/**/*.d.ts",
  ],
};

// next/jest wraps our config so TypeScript, JSX, and CSS are handled by SWC.
export default createJestConfig(config);
