import Entity from './entity';
import System from './system';
import performance from './performance';
import uid from './uid';
import { fastSplice } from './utils';

/**
 *
 * @class
 */
export default class ECS {
    /**
     *
     */
    constructor() {
        /**
         * Store all entities of the ECS.
         *
         * @member {Entity[]}
         */
        this.entities = [];

        /**
         * Store entities which need to be tested at beginning of next tick.
         *
         * @member {Entity[]}
         */
        this.entitiesSystemsDirty = [];

        /**
         * Store all systems of the ECS.
         *
         * @member {System[]}
         */
        this.systems = [];

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
    }

    /**
     * Retrieve an entity by id.
     *
     * @param {number} id - id of the entity to retrieve
     * @return {Entity} The entity if found null otherwise
     */
    getEntityById(id) {
        for (let i = 0; i < this.entities.length; ++i) {
            const entity = this.entities[i];

            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    }

    /**
     * Add an entity to the ecs.
     *
     * @param {Entity} entity - The entity to add.
     */
    addEntity(entity) {
        this.entities.push(entity);

        entity.ecs = this;
        this.setEntitySystemsDirty(entity);
    }

    /**
     * Remove an entity from the ecs by reference.
     *
     * @param {Entity} entity - reference of the entity to remove
     * @return {Entity} the remove entity if any
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        let entityRemoved = null;

        // if the entity is not found do nothing
        if (index !== -1) {
            entityRemoved = this.entities[index];

            entity.dispose();

            this._removeEntityIfDirty(entityRemoved);

            fastSplice(this.entities, index, 1);
        }

        return entityRemoved;
    }

    /**
     * Set the systems dirty flag so the ECS knows this entity needs
     * to recompute eligibility at the beginning of next tick.
     *
     * @param {Entity} entity - The entity to add.
     */
    setEntitySystemsDirty(entity) {
        if (!entity.systemsDirty && entity.ecs === this) {
            entity.systemsDirty = true;

            // add to list of entites to update eligible systems for next tick.
            this.entitiesSystemsDirty.push(entity);
        }
    }

    /**
     * Remove an entity from the ecs by entity id.
     *
     * @param {Entity} id - id of the entity to remove
     * @return {Entity} removed entity if any
     */
    removeEntityById(id) {
        for (let i = 0; i < this.entities.length; ++i) {
            const entity = this.entities[i];

            if (entity.id === id) {
                entity.dispose();

                this._removeEntityIfDirty(entity);

                fastSplice(this.entities, i, 1);

                return entity;
            }
        }

        return null;
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
        for (let i = 0; i < this.entities.length; ++i) {
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
            fastSplice(this.systems, index, 1);
            system.dispose();
        }
    }

    /**
     * Update the ecs.
     *
     * @method update
     */
    update() {
        const now = performance.now();
        const elapsed = now - this.lastUpdate;

        for (let i = 0; i < this.systems.length; ++i) {
            const system = this.systems[i];

            if (this.updateCounter % system.frequency > 0) {
                continue;
            }

            // if the last system flagged some entities as dirty check that case
            if (this.entitiesSystemsDirty.length) {
                this._cleanDirtyEntities();
            }

            system.updateAll(elapsed);
        }

        this.updateCounter += 1;
        this.lastUpdate = now;
    }

    /**
     * Remove an entity from dirty entities by reference.
     *
     * @private
     * @param {Entity} entity - entity to remove
     */
    _removeEntityIfDirty(entity) {
        const index = this.entitiesSystemsDirty.indexOf(entity);

        if (index !== -1) {
            fastSplice(this.entitiesSystemsDirty, index, 1);
        }
    }

    /**
     * "Clean" entities flagged as dirty by removing unecessary
     * systems and adding missing systems.
     *
     * @private
     */
    _cleanDirtyEntities() {
        for (let i = 0; i < this.entitiesSystemsDirty.length; ++i) {
            const entity = this.entitiesSystemsDirty[i];

            for (let s = 0; s < this.systems.length; ++s) {
                const system = this.systems[s];

                // for each dirty entity for each system
                const index = entity.systems.indexOf(system);
                const entityTest = system.test(entity);

                // if the entity is not added to the system yet and should be, add it
                if (index === -1 && entityTest) {
                    system.addEntity(entity);
                }
                // if the entity is added to the system but should not be, remove it
                else if (index !== -1 && !entityTest) {
                    system.removeEntity(entity);
                }
                // else we do nothing the current state is OK
            }

            entity.systemsDirty = false;
        }

        this.entitiesSystemsDirty.length = 0;
    }
}

// expose!
ECS.Entity = Entity;
ECS.System = System;
ECS.uid = uid;

/**
 * An interface describing components.
 *
 * @interface IComponent
 */

/**
 * The name of the component
 *
 * @property
 * @name IComponent#name
 * @type {string}
 */

/**
 * The factory function for the data of this component.
 *
 * @function
 * @name IComponent#data
 * @returns {*} The data object for this component.
 */
