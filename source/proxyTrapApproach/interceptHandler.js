// resource: https://javascript.info/proxy
// https://www.ecma-international.org/ecma-262/10.0/index.html#sec-reflection

import { $ } from './reference.js'
import { MultipleDelegation } from './MultipleDelegation.class.js'

/**
 * This function is aware of MultipleDelegation instances to prevent unnecessary lookups, and prevent circular ones.
 * NOTE: Usage of proxy instead of wrapping in a function will preserve functionalities, for targets that are proxies themselves who have handlers for `has` which will be called first.
 * @param {Object} argument target or additional argument containing target. Note: Use `key` (second argument) as additional argument rather than using `target` (first argument of handler), because when calling reflect.has on the proxy, the handler will be must triggered (using the target as argument will not allow that).
 */
Reflect.has = new Proxy(Reflect.has, {
  apply(reflectHas, thisArg, [target, key /* may hold additional arguments*/]) {
    // ignore additional arguments for objects requesting native implementation of Reflect.has, as the additional arguments are used in targets that are MultipleDelegation proxies only.
    let argument
    if (typeof key === 'object' && Reflect.ownKeys(key).includes($.argument)) {
      argument = key
      ;({ key } = argument) // extract target from additional arguments object
    }

    if (argument) {
      if (target instanceof MultipleDelegation) {
        //  `return reflectHas(target, argument)` - Important using the native reflect has implemenatation will convert the argument object (in place of key parameter) to string, which will not allow the proxy handler to use it.
        return proxyHandler.has(target, argument) // call proxy handler directly.
      }

      if (Reflect.ownKeys(target).includes(key)) return true
      else {
        target = target |> Object.getPrototypeOf // pass on argument additional values
        return target ? Reflect.has(target, argument) : false
      }
    }

    // will trigger the original Reflect.has. In case MultipleDelegation instance, the proxy handler will be triggered
    return reflectHas(target, key)
  },
})

Reflect.get = new Proxy(Reflect.get, {
  apply(reflectGet, thisArg, [target, key, receiver /* may hold additional arguments*/]) {
    // ignore additional arguments for objects requesting native implementation of Reflect.has, as the additional arguments are used in targets that are MultipleDelegation proxies only.
    let visitedTargetHash, argument
    if (typeof receiver === 'object' && Reflect.ownKeys(receiver).includes($.argument)) {
      argument = receiver
      ;({ visitedTargetHash, receiver } = argument)
    }

    if (argument) {
      if (target instanceof MultipleDelegation) {
        return proxyHandler.get(target[$.target], key, argument) // call proxy handler directly, as the receiver function will be overriden by the native call.
      }

      if (!visitedTargetHash.has(target) && Reflect.ownKeys(target).includes(key)) return target[key]

      visitedTargetHash.add(target)

      return Reflect.get(target |> Object.getPrototypeOf, key, {
        [$.argument]: true /** mark object as holding additional arguments */,
        visitedTargetHash,
        receiver: receiver || target,
      })
    }

    // will trigger the original Reflect.has. In case MultipleDelegation instance, the proxy handler will be triggered
    return reflectGet(target, key, receiver || target)
  },
})

export const proxyHandler = {
  /** The getPrototypeOf trap could be added, but there is no proper way to return the multiple prototypes.
   * This implies instanceof won't work neither. Therefore,
   * Origianlly befor this implementation, I let it get the prototype of the target, which initially is null.
   */
  getPrototypeOf: target => {
    return target[$.list] // return array of delegated prototypes
  },

  // The setPrototypeOf trap could be added and accept an array of objects, which would replace the prototypes. This is left as an exercice for the reader. Here I just let it modify the prototype of the target, which is not much useful because no trap uses the target.
  setPrototypeOf: (target, prototype /*May accept a single or multiple prototypes*/) => {
    target[$.setter](prototype) // add prototype to delegated list of prototypes
    return true
  },

  /** 
    The ownKeys trap is a trap for Object.getOwnPropertyNames(). 
    Since ES7, for...in loops keep calling [[GetPrototypeOf]] and getting the own properties of each one. 
    So in order to make it iterate the properties of all prototypes, I use this trap to make all enumerable inherited properties appear like own properties.
  */
  ownKeys(target) {
    let propertyList = new Set(Reflect.ownKeys(target) /*add the symbol for the original target to the proxy own keys*/)
    // in case a multiple delegation proxy as `target`
    for (let object of target[$.list]) if (object[$.target] !== target) propertyList = new Set([...propertyList, ...Reflect.ownKeys(object)]) // add property keys to the unique set.
    return [...propertyList]
  },

  /** 
    The getOwnPropertyDescriptor trap is a trap for Object.getOwnPropertyDescriptor(). 
    Making all enumerable properties appear like own properties in the ownKeys trap is not enough, for...in loops will get the descriptor to check if they are enumerable. 
    So I use find to find the first prototype which contains that property, and I iterate its prototypical chain until I find the property owner, and I return its descriptor. 
    If no prototype contains the property, I return undefined. The descriptor is modified to make it configurable, otherwise we could break some proxy invariants.
  */
  getOwnPropertyDescriptor(target, property) {
    if (Reflect.ownKeys(target).includes(property)) return Object.getOwnPropertyDescriptor(target, property) // provide access for original target from proxy

    let object = target[$.list].find(object => {
      if (object[$.target] !== target) return [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)].includes(property)
    }) // find the object that has that owns the property

    let descriptor
    if (object) {
      descriptor = Object.getOwnPropertyDescriptor(object, property) // try retrieving descriptor on current obj
      descriptor.configurable = true
    }

    return descriptor ? descriptor : undefined
  },

  /** The has trap is a trap for the in operator. I use some to check if at least one prototype contains the property.
   * Note: when called through the native JS reflect.has implementation, the key will be converted to string, if passed an object. Therefore, it is called directly instead when required.
   */
  has(target, key /** can be used as additional argument object */) {
    // check if the first argument holds additional arguments from previous implementation or only the native `target` argument.
    let visitedTargetHash
    if (typeof key === 'object' && Reflect.ownKeys(key).includes($.argument)) {
      let argument = key
      ;({ visitedTargetHash, key } = argument)
    }

    if (Reflect.ownKeys(target).includes(key)) return true // check the target of proxy for keys, providing access to them.

    visitedTargetHash ||= new Set() // follow visited targets that are of type multiple delegation class
    if (visitedTargetHash.has(target)) return false // if already visited then the property was not found on it.
    visitedTargetHash.add(target)

    return target[$.list].some(object => {
      // prevent additional calls when possible.
      if (object !== target)
        return Reflect.has(object, {
          [$.argument]: true /** mark object as holding additional arguments */,
          visitedTargetHash,
          key,
        })
    })
  },

  /*
    The get trap is a trap for getting property values. I use find to find the first prototype which contains that property, and I return the value, 
    or call the getter on the appropriate receiver. This is handled by Reflect.get. If no prototype contains the property, I return undefined.
  */
  get(target, key, receiver /*receiver proxy of target, used also as additional argument*/) {
    if (key == '__proto__') return Reflect.getPrototypeOf(receiver /** in this case it may indicate also a subinstance of proxy */) // special use cases - __proto__ property
    if (key in target) return target[key] // allow access to target's MultipleDelegation Functionalities to get the list of delgations.

    let visitedTargetHash // check if the argument holds additional arguments from previous implementation or only the native `target` argument.
    if (typeof receiver === 'object' && Reflect.ownKeys(receiver).includes($.argument)) {
      let argument = receiver
      ;({ visitedTargetHash, receiver } = argument)
    }

    visitedTargetHash ||= new Set() // follow visited targets that are of type multiple delegation class
    if (visitedTargetHash.has(target)) return false // if already visited then the property was not found on it.
    visitedTargetHash.add(target)
    if (receiver) visitedTargetHash.add(receiver)

    // find the object that has the property (own key or in prototype chain)
    let value
    for (let index = 0; index < target[$.list].length; index++) {
      let object = target[$.list][index]
      if (visitedTargetHash.has(object)) continue // prevent circular calls
      if (
        Reflect.has(object, {
          [$.argument]: true /** mark object as holding additional arguments */,
          visitedTargetHash: new Set([receiver]), // assign prototypes to skip visiting
          key,
        })
      )
        value = Reflect.get(object, key, {
          [$.argument]: true /** mark object as holding additional arguments */,
          visitedTargetHash,
          receiver,
        })

      visitedTargetHash.add(object)

      if (value) return value
    }

    return void 0 // because `undefined` is a global variable and not a reserved word in JS. void simply insures the return of undefined.
  },

  /* 
    The set trap is a trap for setting property values. 
    I use find to find the first prototype which contains that property, and I call its setter on the appropriate receiver. 
    If there is no setter or no prototype contains the property, the value is defined on the appropriate receiver. This is handled by Reflect.set.
  */
  set(target, property, value, receiver) {
    // find the prototype containing the property
    let foundObject = target[$.list].find(object => property in object)
    if (foundObject) Reflect.set(foundObject, property, value, receiver)

    // otherwise set on the target of the proxy (rather than on one of the prototypes).
    return Reflect.set(target, property, value, receiver)
  },

  // define property on target of proxy
  defineProperty(target, key, descriptor) {
    return Reflect.defineProperty(...arguments)
  },

  // The preventExtensions and defineProperty traps are only included to prevent these operations from modifying the proxy target. Otherwise we could end up breaking some proxy invariants.
  preventExtensions: target => false,
}
