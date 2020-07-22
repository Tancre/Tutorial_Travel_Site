const path = require('path');


module.exports = {
  mode: "production",
  entry: "./app/assets/js/App.js",
  output: {
		path: path.resolve(__dirname, "dist/scripts"),
		filename: "App.js"
	},
	module: {
    	rules: [
      		{
        		test: /\.(js)$/,
        		exclude: /node_modules/,
        		use: ['babel-loader']
      		}
    	]
    },
	resolve: {
    extensions: ['*', '.js']
  }
}