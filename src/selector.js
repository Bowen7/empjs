// todo 替换成自己写的
const posthtml = require('posthtml')
const select = (source, type) => {
  let result
  const tree = posthtml().process(source, {
    sync: true
  }).tree
  tree.forEach(block => {
    if (block.tag === type) {
      result = block
    }
  })
  if (!result) {
    return ''
  }
  if (type === 'template') {
    return posthtml().process(result.content, {
      sync: true,
      skipParse: true
    }).html
  } else {
    return result.content.join('')
  }
}
module.exports = select
