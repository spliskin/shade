const { BitField, makeSig } = require('./componentsig.js');
const SparseSet = require('./types/sparseset.js');

class System {
    static sig = new BitField;
    get sig() { return this.constructor.sig; }

    static spec(...components) {
        return makeSig(new BitField, components);
    }

    constructor(priority=0, frequency=1) {
        this.id = -1;
        this.priority = priority;
        this.frequency = frequency;
        this.entities = new SparseSet(4);
        this.enable = true;
        this.tick = 0;
    }

    register(entity) {
        if (this.test(entity))
            this.addEntity(entity)
    }

    test(entity) {
        return this.sig.subset(entity.sig);
    }

    addEntity(entity) {
        this.entities.add(entity);
        entity._addSystem(this);
        this.enter(entity);
    }

    removeEntity(entity) {
        if (this.entities.delete(entity)) {
            entity._removeSystem(this);
            this.exit(entity);
        }
    }

    initialize() {}

    dispose() {
        for (var i=0, m=this.entities.size; i < m; ++i) {
            this.exit(this.entities[i]);
        }
    }

    enter(entity) {}
    exit(entity) {}
    update(elapsed) {}
}

exports = module.exports = System;
