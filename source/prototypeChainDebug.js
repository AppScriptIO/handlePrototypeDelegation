/**
📦 Debugging prototype delegation, specially when proxy wrapped objects exist in the prototype chain.
 * Adds prototype information on static classes, prototypes, and instances.
 * Returns a proxy with traps to add meta information.
 */
function prototypeChainDebug(Class) {
  // Static class
  Class.meta = {
    Class: `${Class.name}`,
    Type: 'static',
  }

  // Prototype
  Class.prototype.meta = {
    Class: `${Class.name}`,
    Type: 'prototype',
  }

  // // Instance
  Class = new Proxy(Class, {
    //     // construct: function(target, argumentsList, newTarget) { // not working causes errors - because the original subclass is not being used to create the instance i.e. superclass creates the isntance & newTarget isn't always pointing to the original class called.
    //     //     let instance = new target(...argumentsList)
    //     //     instance.meta = {
    //     //         Class: `${Class.name}`,
    //     //         Type: 'instance'
    //     //     }
    //     //     return instance
    //     // },
    //     // apply is called, when 'new' is invoked, because of the ES5 transpilation mimicking class feature.
    //     // apply: function(target, thisArg, argumentsList) {
    //     //     console.log(target)
    //     //     console.log(thisArg)
    //     //     console.log(argumentsList)
    //     //     let instance = new target(...argumentsList)
    //     //     return instance
    //     // }
  })

  return Class
}

export { prototypeChainDebug as classDecorator }
export default prototypeChainDebug
