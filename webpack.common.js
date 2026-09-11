const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const fs = require('fs');

module.exports = {
  entry: './src/index.tsx',
  // Persists the compilation cache to disk so unchanged modules skip
  // re-parsing/re-transforming on the next build (dev or prod).
  cache: {
    type: 'filesystem',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          // Type errors are checked separately by ForkTsCheckerWebpackPlugin
          // (in another process) so ts-loader itself only transpiles, not blocks.
          options: { transpileOnly: true },
        },
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
    new ForkTsCheckerWebpackPlugin(),
    // Copy all demo files into dist/demo/ (demo/ is the single source of truth
    // for html, configs, and images — see public/index.html for the doc landing page)
    new CopyWebpackPlugin({
      patterns: [
        { from: 'demo', to: 'demo' },
        { from: 'public/index.html', to: 'index.html' },
        // demo/favicon.ico is already covered by the 'demo' pattern above
        { from: 'public/favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
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
