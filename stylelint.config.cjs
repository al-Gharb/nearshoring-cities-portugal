module.exports = {
  extends: ['stylelint-config-recommended'],
  ignoreFiles: ['dist/**/*', 'node_modules/**/*'],
  rules: {
    'declaration-property-value-keyword-no-deprecated': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
  },
};
