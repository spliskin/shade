const FArray = require('./types/farray.js');
const Entity = require('./entity.js');
const System = require('./system.js');
const performance = require('./performance.js');

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
        this._prioritySort = this._prioritySort.bind(this);

        this.updated = 0;
        this.lastUpdate = performance.now();

        this._pools = [];
/*
        this._updatetype = 0;
        this._updatemethods = [
            this._updateBySystem,
            this._updateByEntity
        ];

        this.update = this._updatemethods[this._updatetype];
*/
        this.update = this._updateBySystem;
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

    createEntity(type) {
        const id = type.tid;
        const pool = this._pools[id];

        var e = pool.pop();
        if (e) {
            e.reset();
        } else {
            e = new type(this, this.nexteid());
        }

        return this._addEntity(e);
    }

    _addEntity(entity) {
        this.entities[entity.id] = entity;

        // iterate over all systems to setup valid systems
        for (var i=0, m=this.systems.size; i < m; ++i) {
            const system = this.systems[i];

            if (system.test(entity)) {
                system.addEntity(entity);
            }
        }

        return entity;
    }

    removeEntity(entity) {
        // only remove the entiy if it's right
        if (this.entities[entity.id] === entity) {
            entity.dispose();

            this.entities[entity.id] = null;
            this._pools[entity.tid].push(entity);
        }

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
/*
    _updateByEntity() {
        const now = performance.now();
        const elapsed = now - this.lastUpdate;

        // update each entity
        for (let i=0, e=this.entities.size; i < e; ++i) {
            const entity = this.entities[i];

            // update each system for the entity
            for (let j=0, m=entity.systems.size; j < m; ++j) {
                const system = entity.systems[j];

                if (this.updated % system.frequency > 0 || !system.enable) {
                    continue;
                }

                system.update(entity, elapsed);
            }
        }

        this.updated += 1;
        this.lastUpdate = now;
    }
*/
    _updateBySystem(elapsed) {
        //const now = performance.now();
        //const elapsed = now - this.lastUpdate;
/*
        for(var i=0, m=this.systems.size; i < m; i++) {
            //const system = this.systems[i];
            //if (this.updated % system.frequency > 0 || !system.enable)
            //    continue;

            this.systems[i].update(elapsed);
        }
*/
        for(var i=0, m=this._sched.length; i < m; i++) {
            this._sched[i].update(elapsed);
        }

        this.updated++;
        //this.lastUpdate = now;
    }

    initpools() {
        const list = Entity.getArchetypes();
        for(var i=0, m=list.length; i < m; i++) {
            const type = list[i];
            this._pools[type.tid] = new FArray;
        }
    }

    init() {
        this.initpools();
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
