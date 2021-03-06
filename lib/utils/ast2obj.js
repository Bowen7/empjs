// 广度优先将一个对象/数组ast转为js对象/数组
const ast2obj = ast => {
  let result
  if (ast.type === 'ObjectExpression') {
    result = {}
  } else if (ast.type === 'ArrayExpression') {
    result = []
  } else {
    return {}
  }
  const stack = [{ node: ast, nodePath: result }]

  const insertValue = (keyName, value, nodePath) => {
    const { type } = value
    if (type === 'Identifier') {
      nodePath[keyName] = value.name
    } else if (type === 'StringLiteral') {
      nodePath[keyName] = value.value
    } else if (type === 'ObjectExpression') {
      const newPath = {}
      nodePath[keyName] = newPath
      stack.push({
        node: value,
        nodePath: newPath
      })
    } else if (type === 'ArrayExpression') {
      const newPath = []
      nodePath[keyName] = newPath
      stack.push({
        node: value,
        nodePath: newPath
      })
    }
  }

  while (stack.length > 0) {
    const current = stack.shift()
    const { node: _node, nodePath: _nodePath } = current
    if (_node.type === 'ObjectExpression') {
      const { properties = [] } = _node
      properties.forEach(prop => {
        const { key, value } = prop
        let keyName = ''
        if (key.type === 'Identifier') {
          keyName = key.name
        } else if (key.type === 'StringLiteral') {
          keyName = key.value
        }
        insertValue(keyName, value, _nodePath)
      })
    } else if (_node.type === 'ArrayExpression') {
      const { elements = [] } = _node
      elements.forEach((element, index) => {
        insertValue(index, element, _nodePath)
      })
    }
  }
  return result
}
module.exports = ast2obj
