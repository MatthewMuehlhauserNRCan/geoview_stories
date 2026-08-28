const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'geoview-story.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      name: 'geoviewStory',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  plugins: [
    // Copy all demo files into dist/demo/
    new CopyWebpackPlugin({
      patterns: [
        { from: 'demo', to: 'demo' },
        { from: 'public/index.html', to: 'index.html' },
        { from: 'public/configs', to: 'configs' },
        { from: 'public/images', to: 'images', noErrorOnMissing: true },
      ],
    }),
    // Create .nojekyll file to bypass GitHub Pages Jekyll processing
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CreateNoJekyll', () => {
          const nojekyllPath = path.join(compiler.options.output.path, '.nojekyll');
          fs.writeFileSync(nojekyllPath, '');
        });
      },
    },
  ],
};
