{
  // C ->> B -> A

  class A {
    constructor(x) {
      this.A = x
    }

    AA() {
      return this.A + this.A
    }
  }

  class B extends A {
    constructor(x, y) {
      super(y)
      this.B = x
    }

    BB() {
      return this.B + this.B
    }
  }

  class _C {
    constructor(x) {
      this.C = x
    }

    CC() {
      return this.C + this.C
    }
  }
  const C = inheritsMultiple(_C, [B])

  const a = new A(1)
  console.log(a)
  console.log(a.AA())

  const b = new B(2, 1)
  console.log(b)
  console.log(b.AA())
  console.log(b.BB())

  const c = new C([3], [[2, 1]])
  console.log(c)
  console.log(c.AA())
  console.log(c.BB())
  console.log(c.CC())
}

{
  // C -> B ->> A

  class A {
    constructor(x) {
      this.A = x
    }

    AA() {
      return this.A + this.A
    }
  }

  class _B {
    constructor(x) {
      this.B = x
    }

    BB() {
      return this.B + this.B
    }
  }
  const B = inheritsMultiple(_B, [A])

  class C extends B {
    constructor(x, y, z) {
      super(y, z)
      this.C = x
    }

    CC() {
      return this.C + this.C
    }
  }

  const a = new A(1)
  console.log(a)
  console.log(a.AA())

  const b = new B([2], [[1]])
  console.log(b)
  console.log(b.AA())
  console.log(b.BB())

  const c = new C(3, [2], [[1]])
  console.log(c)
  console.log(c.AA())
  console.log(c.BB())
  console.log(c.CC())
}

// C ->> B ->> A
{
  class _A {
    constructor(x) {
      this.A = x
    }

    AA() {
      return this.A + this.A
    }
  }
  const A = inheritsMultiple(_A, [])

  class _B {
    constructor(x) {
      this.B = x
    }

    BB() {
      return this.B + this.B
    }
  }
  const B = inheritsMultiple(_B, [A])

  class _C {
    constructor(x) {
      this.C = x
    }

    CC() {
      return this.C + this.C
    }
  }
  const C = inheritsMultiple(_C, [B])

  const a = new A([1], [])
  console.log(a)
  console.log(a.AA())

  const b = new B([2], [[[1]]])
  console.log(b)
  console.log(b.AA())
  console.log(b.BB())

  const c = new C([3], [[[2], [[[1]]]]])
  console.log(c)
  console.log(c.AA())
  console.log(c.BB())
  console.log(c.CC())
}
