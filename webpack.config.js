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
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true
          }
        }
      }
    ]
  }
};

if (process.env.NODE_ENV === 'production') {
  configuration.entry.unshift(require.resolve('whatwg-fetch'));
  configuration.output.filename = 'craft-ai.min.js';
}

module.exports = configuration;
