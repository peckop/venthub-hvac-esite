/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-warning-comments": ["error", { 
        "terms": [
          "eslint-disable-next-line @typescript-eslint/no-explicit-any",
          "eslint-disable @typescript-eslint/no-explicit-any",
          "eslint-disable-line @typescript-eslint/no-explicit-any"
        ],
        "location": "anywhere" 
      }],
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-noninteractive-tabindex": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/iframe-has-title": "warn"
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
          "selector": "TSAsExpression > TSAsExpression",
          "message": "Enterprise Kuralı: 'as unknown as Type' kullanılamaz. Güvenli dönüştürücüler (Type Converters) kullanın."
        },
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
