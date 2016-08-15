# Entity Component System

[![Build Status](https://travis-ci.org/Fae/ecs.svg?branch=master)](https://travis-ci.org/Fae/ecs)

This library implements the entity-component-system pattern in EcmaScript6. This library
was originally based on [yagl/ecs](https://github.com/yagl/ecs), but has been modified
for performance and a focus on assemblages and mixins.

In this ECS implementation components are not only dumb data containers, but are full
mixins that can add functionality to an entity. The method of creating a prototype chain
based on the mixins was derived from [this article][mixins]. Maybe this is more of an
Entity-Mixin-System (EMS)...

## Features

 * **ES6**: The library is written entirely in ES6.
 * **Flexible**: You can subclass the Entity or UIDGenerator classes to implement your
    own logic.
 * **Fast**: Intelligently batches entities and systems so that the minimum amount
    of time is spent on pure iteration.
    - Since the eligibility to systems is computed only when the components list
        change, and in most cases the overhead of systems eligibility will be computed once
        per entity, when added. Therefore there is no overhead for most iterations.
        [Iteration is often considered as a flaw of ecs pattern](https://en.wikipedia.org/wiki/Entity_component_system#Drawbacks).

## Getting started

Here is a "minimalist" example of what you can do with this library:

```js
import ECS from '@fae/ecs';

// components definitions, a component is a "subclass factory".
// That is, a function that takes a base object to extend and
// returns a class that extends that base.
const PositionComponent = (Base) => class extends Base {
    constructor() {
        // entities may have ctor args, so always pass
        // along ctor args in a component.
        super(...arguments);

        this._x = 0;
        this._y = 0;
    }

    get x() { return this._x; }
    set x(v) { this._x = Math.floor(v); }

    get y() { return this._y; }
    set y(v) { this._y = Math.floor(v); }
}

const TextureComponent = (Base) => class extends Base {
    constructor() {
        super(...arguments); // pass along ctor args

        this.texture = new Image();
    }
}

// you can extend ECS.Entity to create a component assemblage
class Sprite extends ECS.Entity.with(PositionComponent, TextureComponent) {
    constructor(imageUrl) {
        super();

        this.texture.src = imageUrl;
    }
}

// you could even extend an assemblage to create a new one that has all the
// components of the parnet:
class SpecializedSprite extends Sprite.with(SpecialComponent) {}

// render system draws objects with texture and position components
class RenderSystem extends ECS.System {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // only handle entities with a position and a texture
    test(entity) {
        return entity.hasComponents(PositionComponent, TextureComponent);
    }

    // called by the ECS in your update loop
    update(entity) {
        this.ctx.drawImage(entity.texture, entity.x, entity.y);
    }
}

// main demo application
const canvas = document.getElementById('renderer');
const ctx = canvas.getContext('2d');
const ecs = new ECS();

// add the system. you can do this at any time since adding/removing a system
// to the ECS will take into account existing entities
ecs.addSystem(new RenderingSystem(ctx));

// and add entities, again you can do this at any time.
ecs.addEntity(new Sprite('/img/something.png'));

// start the game loop
(function update() {
    requestAnimationFrame(update);

    canvas.clearRect(0, 0, canvas.width, canvas.height);

    // iterates all the systems and calls update() for each entity
    // within the system.
    ecs.update();
})();
```

<!-- URLs -->
[mixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
