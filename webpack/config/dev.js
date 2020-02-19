const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const dist = path.resolve(__dirname, '../../dist')

console.log(dist);

module.exports = {
  mode: 'development',
  entry: {
    './scripts/app': './app/scripts/app.js',
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: dist
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use:  [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              name: 'main.css'
            }
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: "file-loader",
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // new CopyPlugin([
    //   { from: './src/resources', to: path.join(dist, 'resources')}
    // ]),
  ],
  devServer: {
    contentBase: path.join(dist, '../lib'),
  }
};