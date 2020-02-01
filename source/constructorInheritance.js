// implement multiple super constructors with ability to pass unique arguments for each during instance creation.
export function inheritsMultipleConstructors({ BaseCtor, SuperCtors }) {
  return new Proxy(BaseCtor, {
    construct(_, [baseArgs = [], superArgs = []], newTarget) {
      let instance = {}

      instance = SuperCtors.reduce((acc, Ctor, i) => {
        const args = superArgs[i] || []
        return Object.assign(acc, new Ctor(...args))
      }, instance)

      instance = Object.assign(instance, new BaseCtor(...baseArgs))

      Object.setPrototypeOf(instance, BaseCtor.prototype)
      return instance
    },
  })
}

// create delegation on constructors & prototypes.
export function inheritsMultiple({ BaseCtor, SuperCtors }) {
  delegateToMultipleObject({
    targetObject: BaseCtor.prototype,
    delegationList: SuperCtors.map(Ctor => Ctor.prototype),
  })

  return inheritsMultipleConstructors({ BaseCtor, SuperCtors })
}
