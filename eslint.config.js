const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  { ignores: ['dist/**', 'deploy/**', 'node_modules/**'] },
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}', 'editor/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Pragmatic default while adopting lint on an existing codebase - several justified `any`
      // uses (ambient GeoView types, generic refs) exist; flag them without failing the build.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Underscore-prefixed names (e.g. `_key` destructured off a draft object purely to omit it
      // from `...rest`) are an intentionally-unused convention throughout the editor's draft model.
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // Just the two classic hooks rules, not v7's full "React Compiler" rule set (set-state-in-effect,
      // refs, immutability, etc.) - those flag several currently-intentional patterns in this codebase.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
