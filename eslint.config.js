import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [

    {
    ignores: [
      '**/tests/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.factory.ts',
      'dist/**'
    ]
  },
  // Базовые правила для JS
  js.configs.recommended,

  // Правила TypeScript с типизированным линтингом
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        XMLHttpRequest: 'readonly',
        XMLHttpRequestResponseType: 'readonly',
        FormData: 'readonly',
        WebSocket: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLElement: 'readonly',
        ErrorEvent: 'readonly',
        URLSearchParams: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURIComponent: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        prompt: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      "no-unused-vars": "off",
      // Строгая типизация (важно для дженериков и интерфейсов)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Убираем строгую типизацию для наименований
      '@typescript-eslint/naming-convention': 'off',
    },
  },

  // Общие правила (без проблемного import/order)
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly'
      }
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-console': 'warn', // чтобы не забыть убрать логи перед деплоем
    },
  },
];
