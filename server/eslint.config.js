import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['coverage'] },
  js.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // Express error handlers need all four args even when some are unused.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
