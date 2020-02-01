/* Example (not originally related example taken from different repo) :

// Creating objects
var o1, o2, o3,
    obj = delegateToMultipleObject({
      baseObject: Object.create(null), 
      superObjects: [ o1={a:1}, o2={b:2}, o3={a:3, b:3} ]
    })

// Checking property existences
'a' in obj; // true   (inherited from o1)
'b' in obj; // true   (inherited from o2)
'c' in obj; // false  (not found)

// Setting properties
obj.c = 3;

// Reading properties
obj.a; // 1           (inherited from o1)
obj.b; // 2           (inherited from o2)
obj.c; // 3           (own property)
obj.d; // undefined   (not found)

// The inheritance is "live"
obj.a; // 1           (inherited from o1)
delete o1.a;
obj.a; // 3           (inherited from o3)

// Property enumeration
for(var p in obj) p; // "c", "b", "a"
*/

// _________________________

/*const a = {};
const b = {a: 1};
const c = {};
const d = {};
const e = {};
const f = {}
const g = {};

inheritsObject(f, c);

delegateToMultipleObject(e, [a, b]);
delegateToMultipleObject(g, [e, f, d]);

console.log(g.a); // 1*/





/*// C ->> B -> A

const A = {
  AA() {
    return 'AA';
  }
};

const B = {
  BB() {
    return 'BB';
  }
};
inheritsObject(B, A);

const C = {
  CC() {
    return 'CC';
  }
};
delegateToMultipleObject(C, [B]);


const x = Object.create(C);
console.log(x);
console.log(x.AA());
console.log(x.BB());
console.log(x.CC());*/





/*// C -> B ->> A

const A = {
  AA() {
    return 'AA';
  }
};

const B = {
  BB() {
    return 'BB';
  }
};
delegateToMultipleObject(B, [A]);

const C = {
  CC() {
    return 'CC';
  }
};
inheritsObject(C, B);


const x = Object.create(C);
console.log(x);
console.log(x.AA());
console.log(x.BB());
console.log(x.CC());*/





/*// C ->> B ->> A

const A = {
  AA() {
    return 'AA';
  }
};

const B = {
  BB() {
    return 'BB';
  }
};
delegateToMultipleObject(B, [A]);

const C = {
  CC() {
    return 'CC';
  }
};
delegateToMultipleObject(C, [B]);

const x = Object.create(C);
console.log(x);
console.log(x.AA());
console.log(x.BB());
console.log(x.CC());*/
