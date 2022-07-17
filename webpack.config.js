const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

/**
 * Options for the Babel
 */
const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: '.cache/babel-loader',
    presets: [
      [
        '@babel/preset-env',
        {
          'useBuiltIns': 'usage',
        },
      ],
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
    ],
  },
};

module.exports = () => {
  return {
    entry: './src/frontend/js/app.js',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './public/dist'),
      libraryExport: 'default', // uses to export .default field of app.js exported class instance
    },
    module: {
      rules: [
        {
          test: /\.p?css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it use publicPath in webpackOptions.output
                // publicPath: '../',
              },
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
            },
          ],
        }, {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            babelLoader,
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        filename: '[name].css',
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  };
};
