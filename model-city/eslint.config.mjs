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
    // Installed skill packages ship their own Node helper scripts.
    ".agents/**",
    "agent/**",
    // Vendored registry code (coss ui primitives + composer + beUI toast): not authored here.
    "src/components/ui/**",
    "src/components/motion/animated-toast-stack.tsx",
    "src/hooks/use-composer-editor.ts",
    "src/lib/composer-editor.ts",
  ]),
]);

export default eslintConfig;
