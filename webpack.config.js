const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Options for the Babel
 */
const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: '.cache/babel-loader',
    presets: [
      'env'
    ],
    plugins: [
      /**
       * Dont need to use «.default» after «export default Class Ui {}»
       * @see  {@link https://github.com/59naga/babel-plugin-add-module-exports}
       */
      // 'add-module-exports',
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
      minimize: true
    }
  };
};
