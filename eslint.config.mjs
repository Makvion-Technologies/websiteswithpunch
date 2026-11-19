import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // New React Compiler checks in eslint-plugin-react-hooks 7 (shipped with eslint-config-next 16).
    // The flagged code is intentional (mount flags that avoid hydration mismatches, latest-callback refs)
    // and behaves the same on React 19, so these report as warnings instead of failing CI.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "workers/**"]),
]);
