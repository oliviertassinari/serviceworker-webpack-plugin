module.exports = {
  root: true, // So parent files don't get applied
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: ['prettier', 'plugin:import/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
  },
  plugins: ['babel', 'import', 'prettier', 'mocha', 'flowtype'],
  settings: {
    'import/resolver': {
      node: {
        // As configured in webpack
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    'arrow-body-style': 'off', // Incompatible with prettier
    'max-len': 'off', // Incompatible with prettier
    'arrow-parens': 'off', // Incompatible with prettier
    'no-confusing-arrow': 'off', // Incompatible with prettier
    indent: 'off', // Incompatible with prettier
    'space-before-function-paren': 'off', // Incompatible with prettier
    semi: ['error', 'never'],
    'consistent-this': ['error', 'self'],
    'no-console': 'error', // airbnb is using warn
    'no-alert': 'error', // airbnb is using warn
    'object-curly-spacing': 'off', // use babel plugin rule
    'no-restricted-properties': 'off', // To remove once react-docgen support ** operator.
    'no-param-reassign': 'off', // Airbnb use error
    'no-mixed-operators': 'off', // allow a + b * c instead of a + (b * c), prettier conflict
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],

    'babel/object-curly-spacing': ['error', 'always'],

    'import/unambiguous': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',

    'mocha/handle-done-callback': 'error',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-global-tests': 'error',
    'mocha/no-pending-tests': 'error',
    'mocha/no-skipped-tests': 'error',

    'react/jsx-filename-extension': 'off', // Airbnb use error

    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        printWidth: 100,
        trailingComma: 'es5',
        semi: false,
      },
    ],
  },
}
