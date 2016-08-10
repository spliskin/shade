Entity Component System
=======================

This library implements the entity-component-system pattern in EcmaScript6. This library
was originally based on [yagl/ecs](https://github.com/yagl/ecs), but has been modified
for performance and a focus on assemblages.

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

// components definitions
const PositionComponent = {
    // you can access the component data on each entity with `entity.<name>`
    name: 'position',
    data: () => {
        return { x: 0, y: 0 };
    },
};

const TextureComponent = {
    // you can access the component data on each entity with `entity.<name>`
    name: 'texture',
    data: () => {
        return new Image();
    },
};

// you can extend ECS.Entity to create a component assemblage
class Sprite extends ECS.Entity {
    constructor(imageUrl) {
        super([PositionComponent, TextureComponent]);

        this.texture.src = imageUrl;
    }
}

// render system draws objects with texture and position components
class RenderSystem extends ECS.Sytem {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // only handle entities with a position and a texture
    test(entity) {
        return !!(entity.texture && entity.position);
    }

    // called by the ECS in your update loop
    update(entity) {
        this.ctx.drawImage(entity.texture, entity.position.x, entity.position.y);
    }
}

// main application
const canvas = document.getElementById('renderer');
const ctx = canvas.getContext('2d');
const ecs = new ECS();

// add the system. you can do this at any time since adding/removing a system
// to the ECS will take into account existing entities
ecs.addSystem(new RenderingSystem(ctx));

// then you can start to add entities
// note: in this example the keyboard control ALL entities on screen
const entity = new Sprite('/img/something.png');

// finally start the game loop
(function update() {
    requestAnimationFrame(update);

    canvas.clearRect(0, 0, canvas.width, canvas.height);

    // iterates the systems and updates each entity within them
    ecs.update();
})();
```
