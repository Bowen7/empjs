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
    return {
      content: '',
      attrs: {}
    }
  }
  const { attrs = {}, content = [] } = result
  if (type === 'template') {
    return {
      content: posthtml().process(content, {
        sync: true,
        skipParse: true
      }).html,
      attrs
    }
  } else {
    return { content: content.join(''), attrs }
  }
}
module.exports = select
