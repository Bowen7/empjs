var path = require("path");

module.exports = {
	mode: "development",
	entry: "./src/index.js",
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: [
					{
						loader: path.resolve("src/v2mp-loader.js")
					}
				]
			}
		]
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
	}
};
