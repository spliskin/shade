const FArray = require('./types/farray.js');
const Entity = require('./entity.js');
const System = require('./system.js');

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
        this.eid = 0;
        this.sid = 0;

        this.systems = new FArray(4);
        this._sched = [];

        this._pools = [];
        this.updated = 0;
    }

    getEntityById(id) {
        return this.entities[id];
    }

    nextsid() {
        return this.sid++;
    }

    nexteid() {
        return this.eid++;
    }

    createEntity(type, ...args) {
        //const pool = this._pools[type.tid];

        //var e = pool.pop();
        //if (e) {
        //    e.reset(...args);
        //} else {
            var e = new type(this, this.nexteid(), ...args);
        //}

        return this._addEntity(e);
    }

    _addEntity(entity) {
        this.entities[entity.id] = entity;

        // iterate over all systems to setup valid systems
        for (var i=0, m=this.systems.size; i < m; ++i) {
            this.systems[i].register(entity);
        }

        return entity;
    }

    removeEntity(entity) {
        this.entities[entity.id] = null;
        //this._pools[entity.tid].push(entity);

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
        system.id = this.nextsid();
        this.systems.push(system);
        system.initialize();

        // iterate over all entities to eventually add system
        for (let i = 0; i < this.entities.size; ++i) {
            const entity = this.entities[i];

            if (system.test(entity)) {
                system.addEntity(entity);
            }
        }
    }

    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.removeAt(index);
            system.dispose();
        }
    }

    update(elapsed) {
        for(var i=0, m=this._sched.length; i < m; i++) {
            const system = this._sched[i];
            if (this.updated % system.frequency > 0)
                continue;

            system.update(elapsed);
        }

        this.updated++;
    }

    //_initpools() {
    //    const list = Entity.getArchetypes();
    //    for(var i=0, m=list.length; i < m; i++) {
    //        const type = list[i];
    //        this._pools[type.tid] = new FArray;
    //    }
    //}

    init() {
        //this._initpools();
        this.reschedule();
    }

    static registerArchetype(type) {
        return Entity.registerArchetype(type);
    }
}

// expose!
ECS.Entity = Entity;
ECS.System = System;

 exports = module.exports = ECS;
