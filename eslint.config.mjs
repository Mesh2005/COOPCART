import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated test-coverage output.
    "coverage/**",
  ]),
  {
    rules: {
      // The React Compiler correctness rules (new in eslint-config-next 16)
      // flag several working patterns — syncing local state from props/action
      // results, and reading the clock inside a Server Component render. Keep
      // them visible as warnings pending a deliberate refactor rather than
      // treating them as build-blocking errors.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;
