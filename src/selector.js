// const { serialize } = require("./parser");
const posthtml = require("posthtml");
const select = (source, query = {}) => {
	let result;
	if (!"type" in query) {
		return result;
	}
	const tree = posthtml().process(source, {
		sync: true
	}).tree;
	const { type } = query;
	tree.forEach(block => {
		switch (type) {
			case "json": {
				let mpType = "";
				try {
					mpType = block.attrs["mp-type"];
				} catch (error) {}
				if (block.tag === "script" && mpType === "json") {
					result = block;
				}
				break;
			}
			case "script": {
				let mpType = "";
				try {
					mpType = block.attrs["mp-type"];
				} catch (error) {}
				if (block.tag === "script" && mpType !== "json") {
					result = block;
				}
				break;
			}
			default:
				if (block.tag === type) {
					result = block;
				}
		}
	});
	if (!result) {
		return "";
	}
	if (type === "template") {
		return posthtml().process(result.content, {
			sync: true,
			skipParse: true
		}).html;
	} else {
		return result.content.join("");
	}
};
module.exports = select;
