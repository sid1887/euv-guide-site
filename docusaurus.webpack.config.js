// docusaurus.webpack.config.js
const webpack = require('webpack');

module.exports = function(context, options) {
  return {
    name: 'custom-webpack-config',
    configureWebpack(config, isServer, utils) {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          "fs": false,
          "path": require.resolve("path-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "url": require.resolve("url/"),
          "util": require.resolve("util/"),
          "zlib": require.resolve("browserify-zlib"),
          "net": false,
          "tls": false,
          "dns": false
        };

        config.plugins.push(
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          })
        );
      }
      return config;
    },
  };
};
