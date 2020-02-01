// expose Symbol keys of multiple delegation proxy functionality. - the 'Reference' of functionality symnol keys
export const $ = {
  // delegation list of prototypes
  list: Symbol('MultipleDelegation: list'),
  getter: Symbol('MultipleDelegation: getter'),
  setter: Symbol('MultipleDelegation: setter'),
  // this symbol must be global to allow multiple versions of the same module to work together.
  target: Symbol.for('MultipleDelegation: non proxied target'), // the original target which should be wrapped with proxy.
  metadata: Symbol('metadata'), // debugging purposes
  argument: Symbol('argument'), // a symbol that is used for allowing passing additional arguments to the Reflect methods/handlers (as the native implementation prevents extra arguments).
}
