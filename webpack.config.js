const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "events": require.resolve("events/"),
      "fs": false,
      "os": false,
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]
};