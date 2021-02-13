const { BitField, makeSig } = require('./componentsig.js');
const SparseSet = require('./types/sparseset.js');

class System {
    static sig = new BitField(8);
    get sig() { return this.constructor.sig; }

    static spec(...components) {
        return makeSig(new BitField(32), components);
    }

    constructor(priority=0, frequency=1) {
        this.id = -1;
        this.priority = priority;
        this.frequency = frequency;
        this.entities = new SparseSet(4);
        this.enable = true;
    }

    register(entity) {
        if (this.sig.subset(entity.sig)) { // this.test(entity)
            //this.add(entity)
            this.entities.add(entity);
        }
    }

    test(entity) {
        return this.sig.subset(entity.sig);
    }

    addEntity(entity) {
        this.entities.add(entity);
        //this.enter(entity);
    }

    removeEntity(entity) {
        this.entities.delete(entity);
        //this.exit(entity);
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
