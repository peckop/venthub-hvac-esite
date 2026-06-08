 
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const tailwindcss = require("eslint-plugin-tailwindcss");
const reactCompiler = require("eslint-plugin-react-compiler");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const unusedImports = require("eslint-plugin-unused-imports");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended"),
  {
    plugins: {
      tailwindcss: tailwindcss,
      "react-compiler": reactCompiler,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "tailwindcss/no-arbitrary-value": "error",
      "react-compiler/react-compiler": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    }
  },
  {
    rules: {
      "react/jsx-no-literals": ["warn", {
        "noStrings": true,
        "allowedStrings": ["-", "+", ":", "/", "%", "x", "X", "•", "·", "©", "VH", "TR", "EN", "ESC", "PCI DSS", "3D Secure", "256-bit SSL", "\"", "“", "”"],
        "ignoreProps": true,
        "noAttributeStrings": false
      }],
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }],
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "@typescript-eslint/no-empty-object-type": ["error", { "allowInterfaces": "with-single-extends" }],
      "no-warning-comments": ["error", { 
        "terms": [
          "eslint-disable-next-line @typescript-eslint/no-explicit-any",
          "eslint-disable @typescript-eslint/no-explicit-any",
          "eslint-disable-line @typescript-eslint/no-explicit-any"
        ],
        "location": "anywhere" 
      }],
      "jsx-a11y/alt-text": ["error", {
        "img": ["Image"]
      }],
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/iframe-has-title": "error"
    }
  },
  {
    ignores: [".next/**", "out/**", "public/**", "supabase/**", "node_modules/**", "next-env.d.ts", ".agent/**", "scripts/**", ".agents/**", ".antigravitycli/**", "tests/**"]
  },
  {
    // .cjs uzantılı dosyalar Node.js CommonJS kuralıyla çalışır.
    // ESM import syntax bu dosyalarda geçersizdir, require() zorunludur.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off"
    }
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
        "warn",
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
        },
        {
          "selector": "JSXAttribute[name.name='alt'] > Literal[value!=\"\"]",
          "message": "Enterprise Kuralı: 'alt' resim açıklamalarını hardcoded (sabit metin) olarak yazamazsınız. Lütfen i18n çeviri anahtarı kullanın."
        },
        {
          "selector": "JSXAttribute[name.name='alt'] > JSXExpressionContainer > Literal[value!=\"\"]",
          "message": "Enterprise Kuralı: 'alt' resim açıklamalarını hardcoded (sabit metin) olarak yazamazsınız. Lütfen i18n çeviri anahtarı kullanın."
        }
      ]
    }
  },
  {
    files: ["src/lib/services/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": [
            "**/lib/supabase/client",
            "@/lib/supabase/client",
            "**/lib/supabase/server",
            "@/lib/supabase/server"
          ],
          "message": "Dependency Injection Guard: Services must not import browser or server Supabase client directly. Injected Supabase client must be passed instead."
        }]
      }]
    }
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/views/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}"
    ],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": [
            "**/lib/supabase/server",
            "@/lib/supabase/server"
          ],
          "message": "Client Environment Guard: Client components/views/providers/hooks must not import server-side Supabase client. Use useSupabaseClient hook or inject browser-side client."
        }]
      }]
    }
  },
  {
    files: [
      "src/components/products/3d/types/RoofFanModel.tsx",
      "src/components/products/InfiniteProductsShowcase.tsx",
      "src/components/products/OrbitalProductsShowcase.tsx",
      "src/contexts/CartProvider.tsx",
      "src/views/admin/AdminReturnsPage.tsx"
    ],
    rules: {
      "react-compiler/react-compiler": "off"
    }
  }
];
