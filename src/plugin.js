const path = require("path");
const ConcatSource = require("webpack-sources").ConcatSource;
function V2mpPlugin(options) {}
const name = "V2mpPlugin";
V2mpPlugin.prototype.apply = function(compiler) {
	compiler.hooks.emit.tapAsync(name, (compilation, callback) => {
		compilation.chunkGroups.forEach((chunkGroup, index) => {
			chunkGroup.chunks.forEach(chunk => {
				if (chunk.id === "manifest") {
					index === 0 && chunkHandler(chunk, compilation, true);
				} else {
					chunkHandler(chunk, compilation, false);
				}
			});
		});
		callback();
	});
};
function chunkHandler(chunk, compilation, isRuntime) {
	const files = chunk.files.filter(file => {
		return path.extname(file) === ".js";
	});
	files.forEach(file => {
		const originalSource = compilation.assets[file];
		const relativePath = path.relative(path.dirname(file), "./manifest.js");
		const source = new ConcatSource();
		if (isRuntime) {
			source.add("const window = {};\n");
			source.add(originalSource);
			source.add("\nmodule.exports=window;");
		} else {
			source.add(`const window=require('${relativePath}');\n`);
			source.add(originalSource);
		}
		compilation.assets[file] = source;
	});
}
module.exports = V2mpPlugin;
