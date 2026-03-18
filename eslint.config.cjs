const { dirname } = require("path");
const { fileURLToPath } = require("url");
const { FlatCompat } = require("@eslint/eslintrc");

// CommonJS'te __filename ve __dirname zaten vardır ama mjs'den devşiriyorsak:
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
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
  {
    files: ["supabase/functions/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
