import assert from 'assert'
import { assert as assertChai } from 'chai'
import prototypeDebug from './entrypoint.js'

class Superclass {
  constructor() {}
}

describe('Prototype Chain Debugger', () => {
  describe('Adds "meta" property to the class\'s elements', () => {
    class Class {
      constructor() {}
    }

    Class = prototypeDebug(Class)
    let instance = new Class()

    it('Static class should have a meta property', () => {
      assert(Class.hasOwnProperty('meta'))
    })

    it('Prototype should have a meta property', () => {
      assert(Class.prototype.hasOwnProperty('meta'))
    })

    it('Instance should have a meta property', () => {
      assertChai.isOk(instance.meta)
    })
  })

  describe('Extended class correctly displays contsructor in meta information when only the class is wrapped with proxy', () => {
    class Superclass {}

    class Class extends Superclass {
      constructor() {
        super()
      }
    }
    Class = prototypeDebug(Class)
    class Subclass extends Class {
      constructor() {
        super()
      }
    }
    let directInstance = new Class()
    let subclassInstance = new Subclass()

    it('directInstance should contain correct meta data of constructing class', () => {
      assert.equal(directInstance.meta.Class, 'Class')
    })
    it('subclassInstance should not have meta', () => {
      assert(!subclassInstance.hasOwnProperty('meta'))
    })
  })

  describe('Extended class should correctly display metadata when all are wrapped with proxies.', () => {
    class Superclass {}
    Superclass = prototypeDebug(Superclass)
    class Class extends Superclass {
      constructor() {
        super()
      }
    }
    Class = prototypeDebug(Class)
    class Subclass extends Class {
      constructor() {
        super()
      }
    }
    Subclass = prototypeDebug(Subclass)
    let directInstance = new Class()
    let subclassInstance = new Subclass()

    it('directInstance should contain correct meta data of constructing class', () => {
      assert.equal(directInstance.meta.Class, 'Class')
    })
    it('subclassInstance should have meta property', () => {
      assertChai.isOk(subclassInstance.meta)
    })
    it('subclassInstance own meta should contain correct contructor info ', () => {
      assert.equal(Subclass.meta.Class, 'Subclass')
    })
    it("Prototype's constructor of instances should be equal to their invoked class", () => {
      assert.equal(directInstance.__proto__.constructor.name, 'Class')
      assert.equal(subclassInstance.__proto__.constructor.name, 'Subclass')
    })
  })
})
