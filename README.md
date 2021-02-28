# Entity Composition System

Shade is a fork of [fae/ecs](https://github.com/Fae/ecs), which was based on [yagl/ecs](https://github.com/yagl/ecs) but modified to focus on assemblages and mixins.

In this implementation components aren't dumb data containers, but full mixins that can add functionality to an entity. The method of creating a prototype chain based on the mixins was derived from [this article][mixins]. This is more of an Entity Composition System, which isn't dynamic at all. The archetypes are rigid types with a specific set of components that are always created when an entity is created. They can't be removed from the entity because the archetype assimilates the component. Basically it's the JS Way of classical inheritance.

Shade is focused on performance at the moment. Increasing it by leaps and bounds over Fae and yagle.

```
Create and delete (entities: 4000)
  makr: 1,482 op/s (±5.84%)
  perform-ecs: 218 op/s (±4.16%)
  yagl-ecs: 3 op/s (±33.80%)
  fae-ecs: 34 op/s (±3.62%)
  shade: 2,113 op/s (±5.40%)

Update (entities: 4000, queries: 3)
  makr: 3,289 op/s (±5.99%)
  perform-ecs: 20,111 op/s (±0.51%)
  yagl-ecs: 4,763 op/s (±1.57%)
  fae-ecs: 6,376 op/s (±0.95%)
  shade: 20,793 op/s (±0.39%)
```

The benchmarks were run using [noctjs/ecs-benchmark](https://github.com/noctjs/ecs-benchmark). The benchmarks always contain variance from run to run because of the nature of js and benchmark.js, so take them with a mountain of salt; they are by no means meant as definitive proof of anything other than a decent idea.

At the moment, I'm able to push shade up to 4k entities created / sec but the framework will loose some features when done. Most other frameworks don't contain the management Fae/yagl did, and I'm ok with that. If you're using Fae or shade, you should be too. I'm fine with paying a price for some features because that's precisely the point. Almost all the other frameworks I've looked through are seriously barren of anything except create / delete entities, components, etc. Which makes the benchmarks even more misleading because as soon as you call one extra function on an object you're results will skew downward immediately, and sometimes in very surprising ways.

## Features

 * **ES6+**: The library is uses modern javascript features
 * **Flexible**: You can subclass the Entity to implement your
    own logic.
 * **Fast**: Intelligently batches entities and systems so that the minimum amount
    of time is spent on pure iteration, creation / deletion.
    - Eligibility to systems is computed on addition only.
    - Entities are pooled by type or as some call an 'Assemblage' or 'Archetype'.

## Roadmap

This is alpha software, no guarantees are made bout it nor can be expressed over it. The API is also subject to change at any time. No warnings will be given (expect breaking changes, at times).

* **Clarify**: Currently working on clearing up the API a bit, as changes were made that aren't set in stone.
* **Painkillers**: Javascript Engine perfs vary widely, from run to run, engine to engine, etc. Basically, immensly stupid. What should be fast is slow, what should be slow is 'fast  -er?' at times.. There IS STILL no conceivable consensus among vendors. Features that get added are highly opinionated, while some very useful features are left out... Object\[iterator\]() exists, just add freakin Object\[index\](idx) already, or hey use a getter/setter. i.e. get @index(idx), but since private members are exposed as #wtfisthispuke, I won't hold my breath waiting.

## Getting started

Here is a "minimalist" example of what you can do with this library:

```js
const ECS = require('./sprite/src/ecs');

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

ECS.registerComponents(PositionComponent, TextureComponent);

// you can extend ECS.Entity to create a component assemblage
class Sprite extends ECS.Entity.with(PositionComponent, TextureComponent) {
    constructor(imageUrl, ...args) {
        super(...args);

        this.texture.src = imageUrl;
    }
}

ECS.registerArchetype(Sprite);

// you could even extend an assemblage to create a new one that has all the
// components of the parnet:
class SpecializedSprite extends Sprite.with(SpecialComponent) {}
ECS.registerArchetype(SpecializedSprite);

// render system draws objects with texture and position components
class RenderSystem extends ECS.System {
    static sig = ECS.System.spec(PositionComponent, TextureComponent);
    priority = 1;

    constructor(ctx, ...args) {
        super(...args);
        this.ctx = ctx;
    }

    // called by the ECS in your update loop
    update(elapsed) {
        for(var i=0, m=this.entities.size; i < m; ++i) {
            const entity = this.entities[i];

            this.ctx.drawImage(entity.texture, entity.x, entity.y);
        }
    }
}

// main demo application
const canvas = document.getElementById('renderer');
const ctx = canvas.getContext('2d');
const ecs = new ECS();

// add the system. you can do this at any time since adding/removing a system
// to the ECS will take into account existing entities
// If you add a system AFTER init, you need to call ecs.reschedule() to re-prioritize the systems.
// this isn't automatic because all apps are different
ecs.addSystem(new RenderingSystem(ctx));
ecs.init();

// and add entities, again you can do this at any time.
// the change here to createEntity is because sprite pools entity types
ecs.createEntity(Sprite, '/img/something.png');

// start the game loop
(function update(stime) {
    requestAnimationFrame(update);

    canvas.clearRect(0, 0, canvas.width, canvas.height);

    // iterates all the systems and calls update() for each entity
    // within the system.
    ecs.update(stime);
})();
```

<!-- URLs -->
[mixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
