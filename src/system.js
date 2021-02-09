const FArray = require('./farray.js');
const { BitField, makeSig } = require('./componentsig.js');

class System {
    static sig = new BitField(8);
    get sig() { return this.constructor.sig; }

    static spec(...components) {
        return makeSig(new BitField(32), components);
    }

    constructor(priority = -1, frequency=-1) {
        this.id = -1;
        this.priority = priority;
        this.frequency = frequency;
        this.entities = new FArray(4);
        this.enable = true;
    }

    test(entity) {
        return this.sig.subset(entity.sig);
    }

    addEntity(entity) {
        this.entities.push(entity);
        this.enter(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.removeAt(index);
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
