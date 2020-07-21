const path = require('path');


module.exports = {
  mode: "production",
  entry: "./app/assets/js/App.js",
  output: {
		path: path.resolve(__dirname, "dist/scripts"),
		filename: "App.js"
	}
}