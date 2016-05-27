var dotenv = require('dotenv');
var webpack = require('webpack');

dotenv.load({
  silent: true,
  path: '../../.env'
});

module.exports = {
    entry: '!mocha!./test.js',
    output: {
      path: __dirname,
      filename: 'bundle.js'
    },
    externals: {
      "body-parser": false,
      "express": false,
      "ws": false
    },
    plugins: [
      new webpack.DefinePlugin({
        __CRAFT_APP_ID__: JSON.stringify(process.env.CRAFT_APP_ID),
        __CRAFT_APP_SECRET__: JSON.stringify(process.env.CRAFT_APP_SECRET),
        __DEBUG__: JSON.stringify(process.env.DEBUG)
      })
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel'],
          exclude: /node_modules/,
          options: {
            cacheDirectory: true
          }
        }
      ]
    }
}
