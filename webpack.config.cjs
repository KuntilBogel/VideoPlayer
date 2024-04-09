const path = require('path');

module.exports = {
  entry: './dist/test.js', // Your main application file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
    libraryTarget: 'umd', 
    library: "idk",
  },
  resolve: {
    extensions: ['.js'], // Allow omitting extensions in 'require' statements
  }, 
};