const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    os: false,
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js', 
    })
  );

  return config;
};