
# multiplePrototypeChain
This module aims to achieve **multiple delegation** of objects, where an object delegates to multiple other prototype chains that could be unrelated to each other. 

- Preserves access to & integrates with the JS native prototype delegation mechanism. Uses JS Proxy to define custom behavior for fundamental operations using.
- Runtime branching during delegated object lookup - Changes of parent prototypes reflects on the delegating object instance.
- Provides also utility functions to re-wire the native prototype chain of an object (e.g. pushing an object to the prototype chain). 
- Opens up options for extended design patterns from traditional parent-child and new single instance creation. 
- Re-wiring prototype chain and inserting new additional instances to the prototype allows for instantiation in stages and grouping of instances together. e.g. instantiating first a `Controller` then from the instance `controller` producing unique object instances that share context or behavior between them.

# Multiple inheritance:

_Multiple delegation is one approach for multiple inheritance._

## Approaches:
Acheiving **multiple inheritance** includes many different approaches, with some tweaks they could adapt to different needs (e.g. contructors could be adjusted to created objects with custom delegation): 
- Concatenation - where an object extends other objects by recursively adding properties to it. e.g. using `Object.assign`.
- Pushing objects to the single native prototype chain - where the prototype chain will grow vertically on each object addition to the chain. e.g. modifying the target object prototype pointer (setPrototypeOf/.__proto__) to an object and appending the original delegation to the new parent object. Or using Class Mixins.
- Lookup behavior modification - overriding the property lookup algorithm to include additional objects and their parents recusevily. e.g. using Proxy to interacte with instance objects, where the proxy will include custom lookup mechanism, and provides runtime branching for multiple delegations.
- etc.

## Parts to consider depending on use case: 
- Construction during instantiation - in some cases calling parent `constructor` methods is required to produce the object instance, in other times this isn't a concern and the delegation is only required for the properties.
    
    In some cases the construction of related instances should be separate is is separated, while only the delegation releationship is relating them together. e.g. an additional instance added as a parent to the prototype of the main instance, in order to group instances together.
- Static methods/properties delegation - required in some cases.
- prototype properties/methods.


## Some resources: 
- Prototypal inheritance using proxies - https://itnext.io/multiple-inheritance-in-js-d39244c791a9
- Nodejs util.inherits - cannot be used with classes (as the specification prevents dynamic class extentions, only one-time using `extend` keyword) 

    - https://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor 
    - Source code https://github.com/nodejs/node/blob/9edce1e12a7b69e7986dd15fce18d6e46590161a/lib/util.js  
    - Explanation https://www.exratione.com/2011/05/inheritance-and-initialization-in-nodejs/
    - Module implementing `util.inherit` with multiple super constructors (vertical inheritance) https://github.com/snowyu/inherits-ex.js

# Dynamic delegation: 
_A design pattern in using prototype chains._

Dynamic in the sense that each instance delegates to a specified prototype chain. i.e. each instance could end up with a different chain although they are created using the same construction function. 

## 2 stages involves: 
- Instance construction (object creation) => produces objects.
- Prototype chain delegation => wires the prototype chain for the Object.

## Approach: 
The created object will delegate to a proxy that will affect the delegated objects/prototypes involved, not only on the immediate parent of the instance but also in upper hierarchies (in case needed).
- In contrast to affected the upper hierarchies, an opposite approach where each object is responsible for it's own delegation. This allows for simpler delegation algorithm and dynamic hierarchy levels. 
- Multiple delegation is an intialization step and functionality can be isolated.
- Techniquely the target is wrapped in a proxy, that contains the functionality for multiple delegation lookup.
