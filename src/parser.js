const util = require("util");
const source = require("./source");
parser = module.exports = {};

// todo -------------------------------
// serialize

const tagName = "([a-zA-Z_][\\w\\-\\.]*)";
const startTag = new RegExp("^<" + tagName);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp("^</(" + tagName + ")[^>]*>");
const attribute = /\s*([^\s<>=]+)(?:\s*=\s*)?([^\s<>=]*)/;
const plainTextElement = ["script", "style"];

const parseHtml = (
	source,
	startF = () => {},
	endF = () => {},
	charsF = () => {}
) => {
	let index = 0;
	let lastTag;
	const stack = [];
	while (source) {
		if (!lastTag || !~plainTextElement.indexOf(lastTag)) {
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
			let rest = void 0;
			if (tagStartIndex >= 0) {
				rest = source.slice(tagStartIndex);
				while (!endTag.test(rest) && !startTag.test(rest)) {
					const next = rest.indexOf("<");
					if (next < 0) {
						break;
					}
					tagStartIndex += next;
				}
				const text = source.slice(0, tagStartIndex);
				charsF(text, index, index + text.length - 1);
				rest = source.slice(tagStartIndex);
				advance(tagStartIndex);
			}
			if (tagStartIndex < 0) {
				source = "";
			}
		} else {
			let endTagLength = 0;
			const capture = new RegExp(
				"([\\S\\s]*?)" + "<[^<]" + lastTag + "[^>]*>"
			);
			let tagText;
			const _source = source.replace(capture, (all, text, endTag) => {
				endTagLength = endTag.length;
				tagText = text;
				return "";
			});
			charsF(tagText, index, index + tagText.length - 1);
			advance(source.length - _source.length);
			parseEndTag(lastTag, index - endTagLength, index);
		}
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
				attrs: [],
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
				match.attrs.push(attr);
			}
			if (end) {
				advance(end[0].length);
				match.end = index;
				match.unary = !!end[1];
				return match;
			}
		}
	}
	function handleStartTag(match) {
		const { tag, unary } = match;
		const attrs = match.attrs.map(attr => {
			const [, name, value] = attr;
			return {
				name,
				value
			};
		});
		if (!unary) {
			stack.push({
				tag,
				attrs
			});
			lastTag = tag;
		}
		startF(tag, attrs, unary, match.start, match.end);
	}
	function parseEndTag(tagName, start, end) {
		const pop = stack.pop();
		if (pop.tag === tagName) {
			const top = stack[stack.length - 1];
			lastTag = top && top.tag;
			endF(tagName, start, end);
		}
	}
};

parser.parse = source => {
	const res = { template: [], script: [], style: [] };
	const stack = [];
	parseHtml(source, start, end, chars);
	return res;
	function start(tag, attrs, unary, start, end) {
		const element = { tag, attrs, children: [], start, content: [] };
		if (stack.length > 0) {
			stack[stack.length - 1].children.push(element);
			if (!unary) {
				stack.push(element);
			} else {
				element.end = end - 1;
			}
		} else {
			if (res[tag]) {
				res[tag].push(element);
				stack.push(element);
			}
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
const res = parser.parse(source);
console.log(util.inspect(res, false, null));
