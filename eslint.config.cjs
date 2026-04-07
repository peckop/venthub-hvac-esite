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
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "jsx-a11y/alt-text": "off"
    }
  },
  {
    ignores: [".next/**", "out/**", "public/**", "supabase/migrations/**", "node_modules/**", "next-env.d.ts", ".agent/**"]
  },
  {
    files: ["src/middleware.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": ["@supabase/supabase-js", "@/lib/supabase"],
          "message": "Enterprise Kuralı: Middleware içinde veritabanı kütüphanesi çekilemez. Rol okumalarını JWT claims üzerinden yapın."
        }]
      }]
    }
  },
  {
    files: ["src/components/**/*.tsx", "src/views/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          "selector": "JSXAttribute[name.name='href'] > Literal[value^='/category']",
          "message": "Enterprise Kuralı: '/category' linklerini elle yazamazsınız. 'Routes.category()' yapısını kullanın."
        },
        {
          "selector": "JSXAttribute[name.name='href'] > Literal[value^='/products']",
          "message": "Enterprise Kuralı: '/products' linklerini elle yazamazsınız. 'Routes.product()' yapısını kullanın."
        },
        {
          "selector": "JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral > TemplateElement[value.raw^='/category']",
          "message": "Enterprise Kuralı: Template strings (`/category/...`) kullanılamaz. 'Routes' kütüphanesini kullanın."
        },
        {
          "selector": "JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral > TemplateElement[value.raw^='/products']",
          "message": "Enterprise Kuralı: Template strings (`/products/...`) kullanılamaz. 'Routes' kütüphanesini kullanın."
        }
      ]
    }
  }
];
