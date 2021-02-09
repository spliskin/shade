const FArray = require('./types/farray');
const { BitField, makeSig } = require('./componentsig');

class System {
    static sig = new BitField(8);
    get sig() { return this.constructor.sig; }

    static spec(...components) {
        var sig = new BitField(32);
        makeSig(sig, components);
        return sig;
    }

    constructor(priority = -1, frequency=-1) {
        this.id = -1;
        this.priority = priority;
        this.frequency = frequency;
        this.entities = new FArray(16);
        this.enable = true;
    }

    addEntity(entity) {
        //entity._addSystem(this);
        this.entities.push(entity);

        this.enter(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);

        if (index !== -1) {
            //entity._removeSystem(this);
            this.entities.removeAt(index);

            this.exit(entity);
        }
    }

    initialize() {}

    dispose() {
        for (let i = 0; i < this.entities.size; ++i) {
            //this.entities[i]._removeSystem(this);
            this.exit(this.entities[i]);
        }
    }

    test(entity) {
        return this.sig.subset(entity.sig);
    }

    enter(entity) {}
    exit(entity) {}
    update(elapsed) {}

    //run(elapsed) {
    //    for(var j=0, e=this.entities.size; j < e; j++) {
    //        this.update(this.entities[j], elapsed);
    //    }
    //}
}

exports = module.exports = System;
