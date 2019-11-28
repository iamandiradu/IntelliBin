const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              '@babel/preset-env',
              {
                plugins: [
                  '@babel/plugin-proposal-class-properties'
                ]
              }
            ]
          },
        }
      }
    ],
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  node: {
    fs: 'empty'
  }
};
