import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/*", "out/*", "public/*", "supabase/migrations/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/jsx-no-comment-textnodes": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "react-refresh/only-export-components": "off",
      "no-unused-vars": "off",
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-empty": ["warn", { "allowEmptyCatch": true }],
      "jsx-a11y/alt-text": "off",
      "no-case-declarations": "off"
    }
  },
  // Edge Functions rules
  {
    files: ["supabase/functions/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];

export default eslintConfig;
