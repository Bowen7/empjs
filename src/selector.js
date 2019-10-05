const { serialize } = require("./parser");
const select = (blocks, query = {}) => {
	if (!"type" in query) {
		return "";
	}
	const { type } = query;
	const results = blocks.filter(block => {
		switch (type) {
			case "json": {
				const mpType = eval("(" + block.attrs["mp-type"] + ")");
				return block.tag === "script" && mpType === "json";
			}
			case "script": {
				const mpType = eval("(" + block.attrs["mp-type"] + ")");
				return block.tag === "script" && mpType !== "json";
			}
			default:
				return block.tag === type;
		}
	});
	if (results.length === 0) {
		return "";
	}
	const result = results.pop();
	if (type === "template") {
		return serialize(result.children);
	} else if (result.content.length > 0) {
		return result.content[0].text;
	}
	return "";
};
module.exports = select;
