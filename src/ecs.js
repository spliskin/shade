const FArray = require('./types/farray');
const Entity = require('./entity');
const System = require('./system');
const performance = require('./performance');

/**
 *
 * @class
 */
class ECS {
    /**
     *
     */
    constructor() {
        /**
         * Store all entities of the ECS.
         *
         * @member {Entity[]}
         */
        this.entities = new FArray(4000);
        this.eid = 0;

        /**
         * Store all systems of the ECS.
         *
         * @member {System[]}
         */
        this.systems = new FArray(8);

        /**
         * Count how many updates have been done.
         *
         * @member {number}
         */
        this.updateCounter = 0;

        /**
         * The last timestamp of an update call.
         *
         * @member
         */
        this.lastUpdate = performance.now();

        this._updatetype = 0;
        this._updatemethods = [
            this._updateBySystem,
            this._updateByEntity
        ];

        this.update = this._updatemethods[this._updatetype];
    }

    /**
     * Retrieve an entity by id.
     *
     * @param {number} id - id of the entity to retrieve
     * @return {Entity} The entity if found null otherwise
     */
    getEntityById(id) {
        for (let i = 0; i < this.entities.size; ++i) {
            const entity = this.entities[i];

            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    }

    nexteid() {
        return this.eid++;
    }

    /**
     * Add an entity to the ecs.
     *
     * @param {Entity} entity - The entity to add.
     */
    addEntity(entity) {
        entity.ecs = this;
        entity.id = this.nexteid();
        this.entities.push(entity);

        // iterate over all systems to setup valid systems
        for (let i = 0; i < this.systems.size; ++i) {
            const system = this.systems[i];

            if (system.test(entity)) {
                system.addEntity(entity);
            }
        }
    }

    /**
     * Remove an entity from the ecs by reference.
     *
     * @param {Entity} entity - reference of the entity to remove
     * @return {Entity} the remove entity if any
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);

        // if the entity is not found do nothing
        if (index !== -1) {
            entity.dispose();

            this.entities.removeAt(index);
        }

        return entity;
    }

    /**
     * Add a system to the ecs.
     *
     * @param {System} system - system to add
     */
    addSystem(system) {
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

    /**
     * Remove a system from the ecs.
     *
     * @param {System} system system reference
     */
    removeSystem(system) {
        const index = this.systems.indexOf(system);

        if (index !== -1) {
            this.systems.removeAt(index);
            system.dispose();
        }
    }

    /**
     * Update the ecs.
     *
     * @method update
     */

    _updateByEntity() {
        const now = performance.now();
        const elapsed = now - this.lastUpdate;

        // update each entity
        for (let i=0, e=this.entities.size; i < e; ++i) {
            const entity = this.entities[i];

            // update each system for the entity
            for (let j=0, m=entity.systems.size; j < m; ++j) {
                const system = entity.systems[j];

                if (this.updateCounter % system.frequency > 0 || !system.enable) {
                    continue;
                }

                system.update(entity, elapsed);
            }
        }

        this.updateCounter += 1;
        this.lastUpdate = now;
    }

    _updateBySystem(elapsed) {
        //const now = performance.now();
        //const elapsed = now - this.lastUpdate;

        for(var i=0, m=this.systems.size; i < m; i++) {
            //const system = this.systems[i];
            //if (this.updateCounter % system.frequency > 0 || !system.enable)
            //    continue;

            this.systems[i].update(elapsed);
        }

        //this.updateCounter += 1;
        //this.lastUpdate = now;
    }
}

// expose!
ECS.Entity = Entity;
ECS.System = System;

 exports = module.exports = ECS;
