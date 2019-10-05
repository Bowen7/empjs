const generate = require("@babel/generator")["default"];
const traverse = require("@babel/traverse")["default"];
const t = require("@babel/types");
const template = require("@babel/template")["default"];
const fs = require("fs");

module.exports = handlers = {};

const DATA_ID = "__v2mp__data__";
const lifetimes = {
	created: "created",
	beforeMount: "attached",
	mounted: "ready",
	beforeDestroy: "detached"
};
// 这里的rootPath是指ExportDefaultDeclaration的path
handlers.dataHandler = (path, rootPath) => {
	const dataFun = path.get("value").node;
	const buildDataDec = template(`const %%id%% = (%%fun%%)()`);
	const dataDec = buildDataDec({
		id: t.identifier(DATA_ID),
		fun: dataFun
	});
	rootPath.insertBefore(dataDec);
	path.node.value = t.identifier(DATA_ID);
};

handlers.propHandler = path => {
	const props = path.get("value").get("properties");
	props.forEach(prop => {
		const propVal = prop.get("value");
		if (t.isObjectExpression(propVal)) {
			const props = propVal.get("properties");
			props.forEach(prop => {
				const keyName = prop.get("key").node.name;
				if (keyName === "default") {
					prop.get("key").node.name = "value";
				}
			});
		}
	});
};

handlers.wxHandler = (path, rootPath, result) => {
	const wxConfig = path.get("value");
	wxConfig.traverse({
		StringLiteral(strPath) {
			const extra = strPath.node.extra;
			if (extra) {
				extra.raw = `"${extra.rawValue}"`;
			}
		},
		Identifier(idPath) {
			const idName = idPath.node.name;
			idPath.replaceWith(t.stringLiteral(idName));
		}
	});
	result.wxConfig = JSON.parse(generate(wxConfig.node).code);
	path.remove();
};

handlers.componentsHandler = (path, rootPath, result) => {
	const components = path.get("value").get("properties");
	const useComponents = {};
	components.forEach(component => {
		const key = component.node.key;
		const componentName = key.value || key.name;
		const componentPath = component.node.value.name;
		useComponents[componentPath] = componentName;
	});
	result.useComponents = useComponents;
	path.remove();
};

handlers.importHandler = (path, result) => {
	let id, importPath;
	path.traverse({
		Identifier(path) {
			id = path.node.name;
		}
	});
	importPath = path.get("source").node.value;
	if (result.useComponents[id]) {
		result.useComponents[id] = importPath;
		path.remove();
	}
};

handlers.variableHandler = (path, result) => {
	const declarations = path.get("declarations.0");
	if (!t.isVariableDeclarator(declarations)) {
		return;
	}
	const init = declarations.get("init");
	if (!t.isCallExpression(init)) {
		return;
	}
	const callee = init.get("callee");
	if (callee.node.name !== "require") {
		return;
	}
	let id, importPath;
	id = declarations.get("id").node.name;
	importPath = init.get("arguments.0").node.value;
	if (result.useComponents[id]) {
		result.useComponents[id] = importPath;
		path.remove();
	}
};

handlers.nameHandler = path => {
	path.remove();
};

handlers.exportDefaultHanlder = path => {
	const componentTemplate = template("Component(%%obj%%);");
	let declarationPath = path.get("declaration");
	if (t.isObjectExpression(declarationPath)) {
		const component = componentTemplate({
			obj: declarationPath.node
		});
		path.replaceWith(component);
	}
};

handlers.lifetimesHandler = path => {
	const lifetimesName = path.node.key.name;
	wxLifetimes = lifetimes[lifetimesName];
	if (wxLifetimes) {
		path.get("key").replaceWith(t.identifier(wxLifetimes));
	}
};
