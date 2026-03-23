/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "jsx-a11y/alt-text": "off"
    }
  },
  {
    ignores: [".next/**", "out/**", "public/**", "supabase/migrations/**", "node_modules/**"]
  }
];
