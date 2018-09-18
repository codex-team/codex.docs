const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Options for the Babel
 */
const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: '.cache/babel-loader',
    presets: [
      '@babel/preset-env',
    ],
    plugins: [
      'babel-plugin-transform-es2015-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import'
    ]
  }
};

module.exports = (env) => {
  return {
    module: {
      rules: [
        {
          test: /\.p?css$/,
          use: ExtractTextPlugin.extract([
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: './src/frontend/'
                }
              }
            }
          ])
        }, {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            babelLoader
          ]
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('bundle.css')
    ],
    optimization: {
      minimize: false
    }
  };
};
