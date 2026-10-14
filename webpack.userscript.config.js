const base = require('./webpack.config');

// Readable review artifact. Keep the established compiledScript.js delivery path.
module.exports = {
  ...base,
  mode: 'production',
  devtool: false,
  optimization: { minimize: false },
  performance: { hints: false }, // A single readable file is intentional for review.
};
