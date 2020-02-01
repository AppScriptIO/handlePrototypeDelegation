// creating a new object and using it for the proxy instead of the target object, allows for simplified implementation of trap functions.
export function instantiateInstance({ type = 'object' } = {}) {
  let instance
  switch (type) {
    case 'function':
      instance = new Function()
      break
    case 'object':
    default:
      instance = Object.create(null)
      break
  }
  return instance
}
