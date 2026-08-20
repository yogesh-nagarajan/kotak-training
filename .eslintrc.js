module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    // Single self-contained blocks that legitimately group more than 4 field-
    // groups: 811-zero-hero-card (4 cards + description) and
    // 811-zero-left-right-section (image, title, description, CTA, reverse).
    // Keep the default limit of 4 for every other block.
    'xwalk/max-cells': ['error', { '*': 4, '811-zero-hero-card': 5, '811-zero-left-right-section': 5 }],
  },
};
