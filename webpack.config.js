import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

export default () => {
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
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          resolve: {
            /**
             * Disable mandatory to specify full paths with extensions using '"type": "module"' in package.json
             * @see https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
             * @see https://stackoverflow.com/questions/69427025/programmatic-webpack-jest-esm-cant-resolve-module-without-js-file-exten
             */
            fullySpecified: false,
          },
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

    /**
     * Show less logs while building
     * https://webpack.js.org/configuration/stats/
     */
    stats: 'minimal'
  };
};
