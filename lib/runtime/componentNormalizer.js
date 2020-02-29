import { registerOptions } from '../core/options'
export default function(options, scopeId) {
  const { props, properties } = options
  if (props && !properties) {
    options.properties = props
    delete options.props
  }
  registerOptions(options, scopeId)
  return scopeId
}
