const FArray = require('./types/farray');
const Entity = require('./entity');
const System = require('./system');
const performance = require('./performance');

class ECS {
    static cid = 0;

    static nextcid() {
        return this.cid++;
    }

    static registerComponent(component) {
        component.id = this.nextcid();
    }

    constructor() {
        this.entities = new FArray(4);
        this.eopen = new FArray(4);
        this.eid = 0;
        this.sid = 0;

        this.systems = new FArray(4);
        this._sched = [];
        this._prioritySort = this._prioritySort.bind(this);

        this.updated = 0;
        this.lastUpdate = performance.now();
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
        for (let i = 0; i < this.entities.size; ++i) {
            const entity = this.entities[i];

            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    }

    nextsid() {
        return this.sid++;
    }

    nexteid() {
        return this.eopen.shift() || this.eid++;
    }

    addEntity(entity) {
        entity.ecs = this;
        entity.id = this.nexteid();
        this.entities[entity.id] = entity;

        // iterate over all systems to setup valid systems
        for (let i = 0; i < this.systems.size; ++i) {
            const system = this.systems[i];

            if (system.test(entity)) {
                system.addEntity(entity);
            }
        }

        return entity;
    }

    removeEntity(entity) {
        //const index = this.entities.indexOf(entity);
        if (this.entities[entity.id] === entity) {

        // if the entity is not found do nothing
        //if (index !== -1) {
            entity.dispose();

            //this.entities.removeAt(index);
            this.entities[entity.id] = null;
            this.eopen.push(entity.id);
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
}

// expose!
ECS.Entity = Entity;
ECS.System = System;

 exports = module.exports = ECS;
