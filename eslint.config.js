import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'build', 'node_modules', 'supabase/functions/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Disallow console logs in app code (allow errors/warns). Edge functions are already ignored via ignores.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Relax strict rules to reduce CI noise while we incrementally fix types
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
  // Allow console.log in scripts, tests, and dev tools
  {
    files: [
      'scripts/**/*.js',
      'scripts/**/*.ts', 
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js', 
      '**/*.spec.ts',
      'tools/**/*.js',
      'tools/**/*.ts',
      'debug/**/*.js',
      'debug/**/*.ts'
    ],
    rules: {
      'no-console': 'off', // Allow all console methods in scripts and tests
    },
  },
)
