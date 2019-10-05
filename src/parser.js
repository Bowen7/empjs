const util = require("util");
// const source = require("./source");
const p = require("@babel/parser");
const generate = require("@babel/generator")["default"];
const traverse = require("@babel/traverse")["default"];
const t = require("@babel/types");
parser = module.exports = {};

// todo -------------------------------
//

const tagName = "([a-zA-Z_][\\w\\-\\.]*)";
const startTag = new RegExp("^<" + tagName);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp("^</(" + tagName + ")[^>]*>");
const attribute = /\s*([^\s<>=]+)(?:\s*=\s*)?([^\s<>=]*)/;
// const plainTextElement = ["script", "style"];

const parseHtml = (
	source,
	startCb = () => {},
	endCb = () => {},
	charsCb = () => {}
) => {
	let index = 0;
	// let lastTag;
	const stack = [];
	while (source) {
		// 简化流程
		// if (!lastTag || !~plainTextElement.indexOf(lastTag)) {
		let tagStartIndex = source.indexOf("<");
		if (tagStartIndex === 0) {
			const endTagMatch = source.match(endTag);
			if (endTagMatch) {
				const curIndex = index;
				advance(endTagMatch[0].length);
				parseEndTag(endTagMatch[1], curIndex, index);
				continue;
			}
			const startTagMatch = parseStartTag();
			if (startTagMatch) {
				handleStartTag(startTagMatch);
				continue;
			}
		}
		if (tagStartIndex >= 0) {
			let rest = source.slice(tagStartIndex);
			while (!endTag.test(rest) && !startTag.test(rest)) {
				const next = rest.indexOf("<");
				if (next < 0) {
					break;
				}
				tagStartIndex += next;
			}
			const text = source.slice(0, tagStartIndex);
			charsCb(text, index, index + text.length - 1);
			advance(tagStartIndex);
		}
		if (tagStartIndex < 0) {
			source = "";
		}
		// 简化流程
		// }
		// else {
		// 	let endTagLength = 0;
		// 	const capture = new RegExp(
		// 		"([\\S\\s]*?)" + "<[^<]" + lastTag + "[^>]*>"
		// 	);
		// 	let tagText;
		// 	const _source = source.replace(capture, (all, text, endTag) => {
		// 		endTagLength = endTag.length;
		// 		tagText = text;
		// 		return "";
		// 	});
		// 	charsCb(tagText, index, index + tagText.length - 1);
		// 	advance(source.length - _source.length);
		// 	parseEndTag(lastTag, index - endTagLength, index);
		// }
	}
	function advance(n) {
		index += n;
		source = source.slice(n);
	}
	function parseStartTag() {
		const start = source.match(startTag);
		if (start) {
			const match = {
				tag: start[1],
				attrs: {},
				start: index
			};
			advance(start[0].length);
			let end, attr;
			while (
				!(end = source.match(startTagClose)) &&
				(attr = source.match(attribute))
			) {
				advance(attr[0].length);
				if (attr[2] === "") {
					attr[2] = true;
				}
				const [, name, value] = attr;
				match.attrs[name] = value;
			}
			if (end) {
				advance(end[0].length);
				match.end = index;
				match.selfClose = !!end[1];
				return match;
			}
		}
	}
	function handleStartTag(match) {
		const { tag, selfClose, attrs, start, end } = match;
		if (!selfClose) {
			stack.push({
				tag,
				attrs
			});
			// lastTag = tag;
		}
		startCb(tag, attrs, selfClose, start, end);
	}
	function parseEndTag(tagName, start, end) {
		const pop = stack.pop();
		if (pop.tag === tagName) {
			// const top = stack[stack.length - 1];
			// lastTag = top && top.tag;
			endCb(tagName, start, end);
		} else {
			console.error("请检查标签嵌套关系");
		}
	}
};

parser.parse = source => {
	const res = [];
	const stack = [];
	parseHtml(source, start, end, chars);
	return res;
	function start(tag, attrs, selfClose, start, end) {
		const element = {
			tag,
			attrs,
			selfClose,
			children: [],
			start,
			content: []
		};
		if (stack.length > 0) {
			stack[stack.length - 1].children.push(element);
			if (!selfClose) {
				stack.push(element);
			} else {
				element.end = end - 1;
			}
		} else {
			res.push(element);
			stack.push(element);
		}
	}
	function end(tag, start, end) {
		const element = stack.pop();
		element.end = end - 1;
	}
	function chars(text, start, end) {
		if (stack.length > 0) {
			const top = stack[stack.length - 1];
			top.content.push({
				text,
				start,
				end
			});
		}
	}
};
parser.serialize = node => {
	let source = "";
	node.forEach(item => {
		source += serializeNode(item) + "\n";
	});
	return source;
	function serializeNode(node) {
		const { tag, attrs, selfClose, children, content } = node;
		let attrString = "";
		for (let name in attrs) {
			const value = attrs[name];
			if (value === true) {
				attrString += ` ${name}`;
			} else {
				attrString += ` ${name}=${value}`;
			}
		}
		if (selfClose) {
			return `<${tag}${attrString} />`;
		}
		const childrenLength = children.length;
		const contentLength = content.length;
		let serializedChildNodes = "";
		let childrenIndex = 0;
		let contentIndex = 0;
		while (childrenIndex < childrenLength || contentIndex < contentLength) {
			if (childrenIndex >= childrenLength) {
				serializedChildNodes += content[contentIndex++].text;
				continue;
			}
			if (contentIndex >= contentLength) {
				serializedChildNodes += serializeNode(
					children[childrenIndex++]
				);
				continue;
			}
			serializedChildNodes +=
				content[contentIndex].start > children[childrenIndex].start
					? serializeNode(children[childrenIndex++])
					: content[contentIndex++].text;
		}
		return `<${tag}${attrString} >${serializedChildNodes}</${tag}>`;
	}
};
// const res = parser.parse(source);
// // console.log(util.inspect(res, false, null));
// // console.log(parser.serialize(res));
// const script = res.filter(item => item.tag === "script")[0];
// const content = script.content[0].text;
// console.log(content);
// const ast = p.parse(content, {
// 	// parse in strict mode and allow module declarations
// 	sourceType: "module"
// });
// console.log(util.inspect(ast, false, null));
// traverse(ast, {
// 	ExportDefaultDeclaration: function(path) {
// 		console.log(path.get("declaration").get("properties"));
// 	}
// });
// const code = generate(ast);
// console.log(util.inspect(code, false, null));
