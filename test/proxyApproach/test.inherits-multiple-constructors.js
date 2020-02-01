import { inheritsMultipleConstructors } from '../../source/proxyTrapApproach/proxyTrapAproach.js'

// C ->> B -> A
{
  class A {
    constructor(x) {
      this.A = x
    }
  }

  class B extends A {
    constructor(x, y) {
      super(y)
      this.B = x
    }
  }

  class _C {
    constructor(x) {
      this.C = x
    }
  }
  const C = inheritsMultipleConstructors(_C, [B])

  const a = new A(1)
  console.log(a)
  console.log(a.A)

  const b = new B(2, 1)
  console.log(b)
  console.log(b.A)
  console.log(b.B)

  const c = new C([3], [[2, 1]])
  console.log(c)
  console.log(c.A)
  console.log(c.B)
  console.log(c.C)
}

// C -> B ->> A
{
  class A {
    constructor(x) {
      this.A = x
    }
  }

  class _B {
    constructor(x) {
      this.B = x
    }
  }
  const B = inheritsMultipleConstructors(_B, [A])

  class C extends B {
    constructor(x, y, z) {
      super(y, z)
      this.C = x
    }
  }

  const a = new A(1)
  console.log(a)
  console.log(a.A)

  const b = new B([2], [[1]])
  console.log(b)
  console.log(b.A)
  console.log(b.B)

  const c = new C(3, [2], [[1]])
  console.log(c)
  console.log(c.A)
  console.log(c.B)
  console.log(c.C)
}

// C ->> B ->> A
{
  class _A {
    constructor(x) {
      this.A = x
    }
  }
  const A = inheritsMultipleConstructors(_A, [])

  class _B {
    constructor(x) {
      this.B = x
    }
  }
  const B = inheritsMultipleConstructors(_B, [A])

  class _C {
    constructor(x) {
      this.C = x
    }
  }
  const C = inheritsMultipleConstructors(_C, [B])

  const a = new A([1], [])
  console.log(a)
  console.log(a.A)

  const b = new B([2], [[[1]]])
  console.log(b)
  console.log(b.A)
  console.log(b.B)

  const c = new C([3], [[[2], [[[1]]]]])
  console.log(c)
  console.log(c.A)
  console.log(c.B)
  console.log(c.C)
}
