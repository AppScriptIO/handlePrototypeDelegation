import assert from 'assert'
import { assert as chaiAssertion } from 'chai'
import util from 'util'
import path from 'path'
import filesystem from 'fs'

import { MultipleDelegation, $ } from '../../source/script.js'

suite('MultipleDelegation Proxy Trap Hanlders:', () => {
  suiteSetup(() => {})

  suite('Proxy traps tests:', () => {
    suite('instanceof', () => {
      let { proxy } = new MultipleDelegation()
      // regular item equality check of two arrays
      test('instance check returning correctly', () => assert(proxy instanceof MultipleDelegation, `• proxy should be considered an instance of MultipleDelegation"`))
      test('only immediately created objects must be considered as instances of MultipleDelegation', () =>
        assert(!(Object.create(proxy) instanceof MultipleDelegation), `• child objects of proxy must not be considered an instance of MultipleDelegation"`))
    })

    suite('getPrototypeOf trap', () => {
      const fixture = { symbol1: Symbol('symbol1'), symbol2: Symbol('symbol2'), key1: 'key1', key2: 'key2' }
      let parent1 = { [fixture.symbol1]: fixture.symbol1, [fixture.key1]: fixture.key1 }
      let parent2 = { [fixture.symbol2]: fixture.symbol2, [fixture.key2]: fixture.key2 }
      const resultFixture = [parent1, parent2]

      let { proxy } = new MultipleDelegation()
      proxy[$.target][$.setter]([parent1, parent2])

      let prototypeList = Reflect.getPrototypeOf(proxy)

      // regular item equality check of two arrays
      test('Should return an array of prototypes', () =>
        assert(prototypeList.every(item => resultFixture.includes(item)) && resultFixture.every(item => prototypeList.includes(item)), `• multiple prorotypes should be returned"`))
    })

    suite('ownKeys trap', () => {
      const fixture = { symbol1: Symbol('symbol1'), symbol2: Symbol('symbol2'), key1: 'key1', key2: 'key2' }
      let parent1 = { [fixture.symbol1]: fixture.symbol1, [fixture.key1]: fixture.key1 }
      let parent2 = { [fixture.symbol2]: fixture.symbol2, [fixture.key2]: fixture.key2 }
      const resultFixture = [...Reflect.ownKeys(Object.assign({}, parent1, parent2)), ...MultipleDelegation.debugging.keyUsedOnTargetInstance]

      let { proxy } = new MultipleDelegation()
      proxy[$.target][$.setter]([parent1, parent2])

      let keyList = Reflect.ownKeys(proxy)

      // regular item equality check of two arrays
      test('Both string and symbol properties must be returned', () =>
        assert(keyList.every(item => resultFixture.includes(item)) && resultFixture.every(item => keyList.includes(item)), `• returned ownKeys must include symbols and string names"`))

      test('Circular lookup should pass', () => {
        // add circular inheritance
        proxy[$.target][$.list].unshift(proxy) // add to begging to always be looked in.
        let objectDelegatingToProxy = Object.setPrototypeOf(Object.create(null), proxy) // add circular proxy in non immediate hierarchy.
        proxy[$.target][$.list].unshift(objectDelegatingToProxy)
        let keyList = []
        keyList = Reflect.ownKeys(proxy)
        assert(keyList.every(item => resultFixture.includes(item)) && resultFixture.every(item => keyList.includes(item)), `• returned ownKeys must include symbols and string names"`)
      })
    })

    suite('getOwnPropertyDescriptor trap', () => {
      const fixture = { symbol1: Symbol('symbol1'), symbol2: Symbol('symbol2'), key1: 'key1', key2: 'key2' }
      let parent1 = { [fixture.symbol1]: fixture.symbol1, [fixture.key1]: fixture.key1 }
      let parent2 = { [fixture.symbol2]: fixture.symbol2, [fixture.key2]: fixture.key2 }
      const resultFixture = [...Reflect.ownKeys(Object.assign({}, parent1, parent2)), ...MultipleDelegation.debugging.keyUsedOnTargetInstance]

      let { proxy } = new MultipleDelegation()
      proxy[$.target][$.setter]([parent1, parent2])

      let keyList = Object.getOwnPropertyDescriptors(proxy) |> Reflect.ownKeys

      // regular item equality check of two arrays
      test('symbols and string keys must be returned', () =>
        assert(keyList.every(item => resultFixture.includes(item)) && resultFixture.every(item => keyList.includes(item)), `• returned ownKeys must include symbols and string names only"`))

      test('Circular lookup should pass', () => {
        // add circular inheritance
        proxy[$.target][$.list].unshift(proxy) // add to begging to always be looked in.
        let objectDelegatingToProxy = Object.setPrototypeOf(Object.create(null), proxy) // add circular proxy in non immediate hierarchy.
        proxy[$.target][$.list].unshift(objectDelegatingToProxy)
        let keyList = Object.getOwnPropertyDescriptors(proxy) |> Reflect.ownKeys
        assert(keyList.every(item => resultFixture.includes(item)) && resultFixture.every(item => keyList.includes(item)), `• returned ownKeys must include symbols and string names"`)
      })
    })

    suite('has trap', () => {
      const fixture = { symbol1: Symbol('symbol1'), symbol2: Symbol('symbol2'), key1: 'key1', key2: 'key2' }
      let parent1 = { [fixture.symbol1]: fixture.symbol1, [fixture.key1]: fixture.key1 }
      let parent2 = { [fixture.symbol2]: fixture.symbol2, [fixture.key2]: fixture.key2 }
      const resultFixture = [...Reflect.ownKeys(Object.assign({}, parent1, parent2)), ...MultipleDelegation.debugging.keyUsedOnTargetInstance]

      let { proxy } = new MultipleDelegation()
      proxy[$.target][$.setter]([parent1, parent2])

      test('Should check properties existence:', () => {
        assert(
          resultFixture.every(value => Reflect.has(proxy, value)),
          `• existing properties were not found"`,
        )
        assert(!Reflect.has(proxy, 'nonExistingKey'), `• nonexisting property check failed`)
      })

      test('Circular lookup should pass', () => {
        // add circular inheritance
        proxy[$.target][$.list].unshift(proxy) // add to begging to always be looked in.
        let objectDelegatingToProxy = Object.setPrototypeOf(Object.create(null), proxy) // add circular proxy in non immediate hierarchy.
        proxy[$.target][$.list].unshift(objectDelegatingToProxy)
        assert(
          resultFixture.every(value => Reflect.has(proxy, value)),
          `• existing properties were not found"`,
        )
        assert(!Reflect.has(proxy, 'nonExistingKey'), `• nonexisting property check failed`)
      })
    })

    //TODO: Add support for `getter` properties. If a getter is retrieved, then executed with the `reciever` (of the get handler) as `this`. Check the native js specification.
    suite('get trap', () => {
      const fixture = { symbol1: Symbol('symbol1'), symbol2: Symbol('symbol2'), key1: 'key1', key2: 'key2' }
      let parent1 = { [fixture.symbol1]: fixture.symbol1, [fixture.key1]: fixture.key1 }
      let parent2 = { [fixture.symbol2]: fixture.symbol2, [fixture.key2]: fixture.key2 }
      const resultFixture = {
        key: [...Reflect.ownKeys(Object.assign({}, parent1, parent2))],
        value: Object.assign({}, parent1, parent2),
        target: {
          key: MultipleDelegation.debugging.keyUsedOnTargetInstance,
        },
      }

      let { target, proxy } = new MultipleDelegation()
      proxy[$.target][$.setter]([parent1, parent2])

      test('Should retrieve properties from the different prototypes:', () => {
        assert(
          resultFixture.key.every(key => resultFixture.value[key] === Reflect.get(proxy, key)),
          `• existing properties were not retrieved"`,
        )
        assert(
          resultFixture.target.key.every(key => Reflect.get(proxy, key)),
          `• existing properties of multipleDelegation target directly were not retrieved"`,
        )
        assert(Reflect.get(proxy, 'nonExistingKey') == undefined, `• nonexisting property retrieval should return undefined`)
      })

      test('Circular lookup should pass', () => {
        // add circular inheritance
        proxy[$.target][$.list].unshift(proxy) // add to begging to always be looked in.
        let objectDelegatingToProxy = Object.setPrototypeOf({ label: 'intermediate parent' }, proxy) // add circular proxy in non immediate hierarchy.
        proxy[$.target][$.list].unshift(objectDelegatingToProxy)
        assert(
          resultFixture.key.every(key => resultFixture.value[key] === Reflect.get(proxy, key)),
          `• existing properties were not retrieved"`,
        )
        assert(
          resultFixture.target.key.every(key => Reflect.get(proxy, key)),
          `• existing properties of multipleDelegation target directly were not retrieved"`,
        )
        assert(Reflect.get(proxy, 'nonExistingKey') == undefined, `• nonexisting property retrieval should return undefined`)
      })
    })
  })
})

suite('MultipleDelegation API - Multiple Prototype Chain creation', () => {
  suite('create multiple delegation proxy and lookup properties', () => {
    let p1 = { label: 'p1', v1: 'v1' },
      p2 = { label: 'p2', v2: 'v2' }

    let { proxy } = new MultipleDelegation([p1, p2])
    test('Access property from delegaiton chain', () => {
      assert(proxy.v1 == 'v1', `• Failed to access "v1" property.`)
      assert(proxy.v2 == 'v2', `• Failed to access "v2" property.`)
    })
  })

  suite('Prevent adding circular immediate delegation for existing multiple delegation instance', () => {
    let p1 = { label: 'p1', v1: 'v1' },
      p2 = { label: 'p2', v2: 'v2' }

    let instance = Object.create(null)
    MultipleDelegation.addDelegation({ targetObject: instance, delegationList: [p1] })
    MultipleDelegation.addDelegation({ targetObject: instance, delegationList: [p2] })

    test('Access property from delegaiton chain', () => {
      assert(instance.v1 == 'v1', `• Failed to access "v1" property.`)
      assert(instance.v2 == 'v2', `• Failed to access "v2" property.`)
    })
    test('No circular delegaiton should be found', () => {
      let proxy = Object.getPrototypeOf(instance)
      proxy[$.target][$.list].every(prototype => prototype !== proxy)
    })
  })

  suite('Accessing property through getters (prevent infinite getter lookup)', () => {
    let instance = { label: 'instance' },
      parent = { label: 'parent', value: 'value' }

    Object.setPrototypeOf(instance, parent)
    /**
     *  1. current prototype shouldn't be added twice.
     *  2. In case duplicate prototypes are added, property lookup shouldn't cause infinite lookup errors.
     *  3. getOwnPropertyKeys should work - console.log calls getOwnPropertyKeys which caused infinite lookup loops before.
     */
    MultipleDelegation.addDelegation({
      targetObject: instance,
      delegationList: [instance /*circular delegation*/, Object.create(instance) /*circular delegation with intermediate parent*/, parent],
    })

    test('Ensure no infinite lookup of property in the hierarchy is being executed', () => {
      try {
        instance.nonExistingProperty // |> console.log
        instance.constructor // |> console.log
        Object.getOwnPropertyDescriptors(instance) // |> console.log
        Object.getOwnPropertyDescriptors(instance |> Object.getPrototypeOf) // |> console.log // currently will return the descriptors of the first prototype in the list (Usually MultipleDelegation class prototype)
        assert(instance.label === 'instance', `• Property lookup failed for "label"`)
        assert(instance.value === 'value', `• Property lookup failed for "value"`)
      } catch (error) {
        console.log('• Error: Getter lookup caused infinite loop.')
        throw error
      }
    })
    test('Ensure lookup in prototype list works', () => {
      assert(instance.label === 'instance', `• Property lookup failed for "label"`)
      assert(instance.value === 'value', `• Property lookup failed for "value"`)
    })
  })
})
