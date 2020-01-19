const path = require("path");
const acorn = require("acorn");
const acornWalk = require("acorn-walk");
const convertObj = node => {
	const result = {};
	if (node.type !== "ObjectExpression") {
		return result;
	}
};
const walk = script => {
	let importComponents = {};
	let pages;
	let components;
	let configs = {};
	acornWalk.simple(acorn.parse(script, { sourceType: "module" }), {
		ImportDeclaration(node) {
			const { specifiers, source } = node;
			const { value } = source;
			if (path.extname(value) === ".vue") {
				const specifier = specifiers[0];
				const { local = {} } = specifier;
				const { name = "" } = local;
				importComponents[name] = value;
			}
		},
		ExportDefaultDeclaration(node) {
			const { declaration } = node;
			if (declaration.type !== "ObjectExpression") {
				return;
			}
			const { properties = [] } = declaration;
			properties.forEach(prop => {
				const { key, value } = prop;
				const { name = "" } = key;
				if (name === "_pages") {
					page = convertObj(value);
				} else if (name === "_components") {
					components = convertObj(value);
				}
				if (name === "_config") {
					config = convertObj(value);
				}
			});
		}
	});
	return {
		pages,
		components,
		configs
	};
};
module.exports = walk;
