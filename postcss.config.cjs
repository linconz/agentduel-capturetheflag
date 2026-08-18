module.exports = {
  plugins: {
    'postcss-prefix-selector': {
      prefix: '.agentduel-capturetheflag',
      transform(prefix, selector, prefixedSelector) {
        return selector.includes(prefix) ? selector : prefixedSelector;
      }
    }
  }
};
