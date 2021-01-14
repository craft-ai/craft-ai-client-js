const dotenv = require('dotenv');
const webpack = require('webpack');
const config = require('../../webpack.config');

dotenv.load({
  silent: true,
  path: '../../.env'
});

module.exports = {
  entry: [
    require.resolve('babel-polyfill'),
    require.resolve('whatwg-fetch'),
    '!mocha-loader!./test.js'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __CRAFT_TOKEN__: JSON.stringify(process.env.CRAFT_TOKEN),
      __CRAFT_OWNER__: JSON.stringify(process.env.CRAFT_OWNER),
      __CRAFT_URL__: JSON.stringify(process.env.CRAFT_URL),
      __DEBUG__: JSON.stringify(process.env.DEBUG),
      __JOB_ID__: JSON.stringify(process.env.JOB_ID)
    })
  ],
  module: config.module
};
