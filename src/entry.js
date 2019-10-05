const selector = require("./selector");
const parser = require("./parser");
const path = require("path");
const fs = require("fs");
const { genJsonObj } = require("./helpers");
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
		entryies[page] = `${path.join(rootPath, page)}.vue`;
	});
	console.log(entryies);
	return entryies;
};
