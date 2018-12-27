const path = require('path');
const webpack = require('webpack');

const configuration = {
  entry: ['./src/bundle.js'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'craft-ai.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'CRAFT_TOKEN': undefined,
        'CRAFT_URL': undefined
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [
            ['env', {
              targets: {
                browsers: 'last 2 versions, > 5%'
              },
              modules: false,
              useBuiltIns: true
            }]
          ]
        }
      }
    ]
  }
};

if (process.env.NODE_ENV === 'production') {
  configuration.entry.unshift(require.resolve('babel-polyfill'), require.resolve('whatwg-fetch'));
  configuration.output.filename = 'craft-ai.min.js';
  configuration.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    comments: false
  }));
}

module.exports = configuration;
