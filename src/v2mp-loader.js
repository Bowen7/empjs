const parser = require("./parser");
const path = require("path");
const selector = require("./selector");
const { genJson } = require("./helpers");

module.exports = function(source) {
	const result = parser.parse(source);
	if (this.query) {
		return selector(result, JSON.parse(this.query.slice(1)));
	}
	const basename = path.basename(this.resourcePath);
	const styleQuery = JSON.stringify({ type: "style" });
	const style = `const __v2mp__style__ = require('!!mini-css-extract-plugin/dist/loader.js!css-loader!sfm?${styleQuery}!./${basename}');`;

	const script = selector(result, { type: "script" });

	const emitPath = path
		.relative(`${this.rootContext}/src`, this.resourcePath)
		.replace(/\..*/, "");

	const json = selector(result, { type: "json" });
	this.emitFile(`${emitPath}.json`, genJson(json));

	const template = selector(result, { type: "template" });
	this.emitFile(`${emitPath}.wxml`, template);

	return `${style}\n${script}`;
};
