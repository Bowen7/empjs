const parser = require("@babel/parser");
const generate = require("@babel/generator")["default"];
const traverse = require("@babel/traverse")["default"];
const t = require("@babel/types");

const helpers = (module.exports = {});
helpers.getJson = source => {
	let json = {};
	const ast = parser.parse(source, {
		sourceType: "module"
	});
	traverse(ast, {
		ExportDefaultDeclaration(rootPath) {
			let declarationPath = rootPath.get("declaration");
			if (t.isObjectExpression(declarationPath)) {
				const code = generate(declarationPath.node).code;
				json = eval("(" + code + ")");
			}
		}
	});
	return json;
};
helpers.getJsonStr = source => {
	return JSON.stringify(helpers.getJson(source), null, 2);
};
