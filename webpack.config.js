var webpack = require('webpack');

var configuration = {
  entry: './src/bundle.js',
  output: {
    path: __dirname + '/dist',
    filename: 'craft-ai.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env' :{
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'CRAFT_TOKEN': undefined,
        'CRAFT_URL': undefined
      }
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
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ]
  }
};

if (process.env.NODE_ENV === 'production') {
  configuration.output.filename = 'craft-ai.min.js';
  configuration.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    comments: false
  }));
}

module.exports = configuration;
