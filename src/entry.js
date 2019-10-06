const selector = require("./selector");
const parser = require("./parser");
const path = require("path");
const fs = require("fs");
const { genJsonObj } = require("./helpers");

const getComponents = (pagePath, rootPath) => {
	const components = [];
	const page = fs.readFileSync(pagePath).toString();
	const result = parser.parse(page);
	const pageJson = selector(result, { type: "json" });
	const pageJsonContent = genJsonObj(pageJson);
	const usingComponents = pageJsonContent.usingComponents || {};
	for (let key in usingComponents) {
		const componentPath = path.join(
			path.dirname(pagePath),
			usingComponents[key]
		);
		components.push(path.relative(rootPath, componentPath));
	}
	return components;
};
module.exports.getEntries = appPath => {
	const rootPath = path.join(process.cwd(), path.dirname(appPath));
	let entryies = { app: path.resolve(appPath) };
	const appAbPath = path.join(process.cwd(), appPath);
	const app = fs.readFileSync(appAbPath).toString();
	const result = parser.parse(app);
	const appJson = selector(result, { type: "json" });
	const appJsonContent = genJsonObj(appJson);
	const pages = appJsonContent.pages || [];
	pages.forEach(page => {
		const pagePath = `${path.join(rootPath, page)}.vue`;
		entryies[page] = pagePath;
		const components = getComponents(pagePath, rootPath);
		components.forEach(component => {
			entryies[component] = `${path.join(rootPath, component)}.vue`;
		});
	});
	return entryies;
};
