//! Deprecated: This is an old quick specific implementation.

let self = class MultiplePrototypeChain {
  static newChainOnInstanceCreation({
    Class, // wrap constructor of Class and create a new chain for each new instance.
    contextInstance, // The instnace to be added to the chain.
  }) {
    return new Proxy(Class, {
      construct: (target, argumentsList, newConstructorFunc) => {
        let instance = Reflect.construct(target, argumentsList)
        instance = self.createUniqueProtoChain({ object: instance })
        instance = self.insertObjectToPrototypeChain({
          prototypeChain: instance,
          objectToAdd: contextInstance,
          beforePrototype: contextInstance.__proto__.__proto__,
        })
        return instance
      },
    })
  }

  static createUniqueProtoChain({ object = null }) {
    if (object == null || object.constructor == Object || object.constructor == Function) return object

    let delegatedPrototype = Object.getPrototypeOf(object)
    let nextPointerPrototype = self.createUniqueProtoChain({ object: delegatedPrototype })
    let pointerPrototype = Object.create(nextPointerPrototype)
    if (!pointerPrototype.hasOwnProperty('delegatedPrototype')) {
      Object.defineProperty(pointerPrototype, 'delegatedPrototype', { value: object, writable: true, enumerable: true, configurable: true })
    }
    let proxyHandler = self.handlerMultiplePrototypeChainPattern({ delegatedPrototype: object })
    pointerPrototype = new Proxy(pointerPrototype, proxyHandler)
    return pointerPrototype
  }

  static handlerMultiplePrototypeChainPattern({ delegatedPrototype }) {
    return {
      get: function(target, property, receiver) {
        switch (property) {
          case 'delegatedPrototype':
            return Reflect.get(target, property)
            break
          case '__proto__':
            return Object.getPrototypeOf(receiver)
            break
          default:
            break
        }
        if (delegatedPrototype.hasOwnProperty(property)) {
          return Reflect.get(delegatedPrototype, property)
        } else if (Object.getPrototypeOf(target)) {
          return Reflect.get(Object.getPrototypeOf(target), property)
        } else {
          return undefined
        }
      },
      set: function(target, property, value, receiver) {
        switch (property) {
          case '__proto__':
            return Object.setPrototypeOf(target, value)
            break
          default:
            return Reflect.set(delegatedPrototype, property, value)
            break
        }
      },
      has: function(target, prop) {
        return prop in delegatedPrototype
      },
    }
  }

  // Add an instance prototype to a prototype chain just before the instance's constructor prototype.
  static insertObjectToPrototypeChain({
    prototypeChain, // chain to add to
    objectToAdd, // object to add as prototype
    beforePrototype, // location of insertion
  }) {
    // find position of beforePrototype with references to next and previous prototype
    let previousPrototype = prototypeChain // starting point
    let nextPrototype = prototypeChain.__proto__
    while (nextPrototype && beforePrototype !== nextPrototype.delegatedPrototype) {
      previousPrototype = nextPrototype
      nextPrototype = nextPrototype.__proto__
    }
    if (!nextPrototype) throw new Error('• Couldn`t add object to prototype chain. No matching "beforePrototype" was found.') // if no appropriate insertion position was found.
    // create pointerPrototype to add between the previous and next prototypes.
    let pointerPrototype = Object.create(nextPrototype)
    if (!pointerPrototype.hasOwnProperty('delegatedPrototype')) {
      Object.defineProperty(pointerPrototype, 'delegatedPrototype', { value: objectToAdd, writable: true, enumerable: true, configurable: true })
    }
    pointerPrototype = new Proxy(
      pointerPrototype,
      self.handlerMultiplePrototypeChainPattern({
        delegatedPrototype: objectToAdd,
      }),
    )
    Object.setPrototypeOf(previousPrototype, pointerPrototype)
    return prototypeChain
  }
}

export { self as MultiplePrototypeChain }
