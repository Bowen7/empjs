const parser = require("@babel/parser");
const generate = require("@babel/generator")["default"];
const traverse = require("@babel/traverse")["default"];
const t = require("@babel/types");
const fs = require("fs");
const {
	dataHandler,
	propHandler,
	wxHandler,
	componentsHandler,
	importHandler,
	variableHandler,
	nameHandler,
	exportDefaultHanlder,
	lifetimesHandler
} = require("./handlers");

const prop2handler = {
	data: dataHandler,
	props: propHandler,
	wx: wxHandler,
	components: componentsHandler,
	name: nameHandler
};

module.exports = resolveScript = script => {
	const result = { wxConfig: {}, useComponents: {} };

	const ast = parser.parse(script, {
		sourceType: "module"
	});
	traverse(ast, {
		ExportDefaultDeclaration(rootPath) {
			let declarationPath = rootPath.get("declaration");
			if (t.isObjectExpression(declarationPath)) {
				const properties = declarationPath.get("properties");
				properties.forEach(property => {
					const key = property.node.key.name;
					const handler = prop2handler[key];
					if (handler) {
						handler(property, rootPath, result);
					} else {
						lifetimesHandler(property, rootPath);
					}
				});
			}
			exportDefaultHanlder(rootPath);
		}
	});

	traverse(ast, {
		ImportDeclaration(path) {
			importHandler(path, result);
		},
		VariableDeclaration(path) {
			variableHandler(path, result);
		}
	});
	return result;
};
