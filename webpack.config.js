const path = require('path');


module.exports = {
  mode: "production",
  entry: {
    App: "./app/assets/js/App.js", 
    Vendor: "./app/assets/js/Vendor.js"
  },
  output: {
		path: path.resolve(__dirname, "dist/scripts"),
		filename: "[name].js"
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