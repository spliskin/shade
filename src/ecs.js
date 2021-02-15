const FArray = require('./types/farray.js');
const Entity = require('./entity.js');
const System = require('./system.js');
const { registerArchetypes, getArchetypes } = require('./archetype.js');

class ECS {
    static _components=[];
    static registerComponents(...list) {
        for(var i=0, m=list.length; i < m; i++) {
            const component = list[i];
            component.id = this._components.length;
            this._components.push(component);
        }
    }

    constructor() {
        this.entities = new FArray(4);
        this.systems = new FArray(4);
        this._sched = [];

        this._pools = [];
        //this.updated = 0;
    }

    getEntityById(id) {
        return this.entities[id];
    }

    createEntity(type, ...args) {
        const pool = this._pools[type.tid];

        var e = pool.pop();
        if (e) {
            e.reset(...args);
        } else {
            e = new type(...args, this, this.entities.size);
        }

        return this._addEntity(e);
    }

    _addEntity(entity) {
        this.entities.insert(entity.id, entity);

        // iterate over all systems to setup valid systems
        for (var i=0, m=this.systems.size; i < m; ++i) {
            this.systems[i].register(entity);
        }

        return entity;
    }

    removeEntity(entity) {
        // iterate over all systems to remove entity
        for (var i=0, m=this.systems.size; i < m; ++i) {
            this.systems[i].removeEntity(entity);
        }

        this.entities[entity.id] = null;
        this._pools[entity.tid].push(entity);

        return entity;
    }

    _prioritySort(a, b) {
        return a.priority - b.priority;
    }

    reschedule() {
        var counter=-1;
        for(var i=0, m=this.systems.size; i < m; i++) {
            const system = this.systems[i];
            if (system.priority !== -1)
                this._sched[++counter] = system;
        }

        this._sched.length = counter+1
        if (this._sched.length > 1)
            this._sched.sort(this._prioritySort);
    }

    addSystem(system) {
        system.id = this.systems.size;
        this.systems.insert(system.id, system);
        system.initialize();

        // iterate over all entities to eventually add system
        for (let i = 0; i < this.entities.size; ++i) {
            system.register(this.entities[i]);
        }
    }

    removeSystem(system) {
        this.systems.removeAt(system.id);
        system.dispose();
    }

    update(elapsed) {
        for(var i=0, m=this._sched.length; i < m; i++) {
            const system = this._sched[i];
            if (++system.tick >= system.frequency) {
                system.tick = 0;
                system.update(elapsed);
            }
        }

        //this.updated++;
    }

    _initpools() {
        const list = getArchetypes();
        for(var i=0, m=list.length; i < m; i++) {
            const type = list[i];
            this._pools[type.tid] = new FArray;
        }
    }

    init() {
        this._initpools();
        this.reschedule();
    }
}

// expose!
ECS.registerArchetypes = registerArchetypes;
ECS.Entity = Entity;
ECS.System = System;

 exports = module.exports = ECS;
