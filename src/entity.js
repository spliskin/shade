import uid from './uid';
import { fastSplice } from './utils';

/**
 * An entity.
 *
 * @class
 * @alias ECS.Entity
 */
export default class Entity {
    /**
     *
     * @param {Component[]} components - An array of initial components.
     * @param {number|UIDGenerator} idOrGenerator - The entity id if
     *  a Number is passed. If an UIDGenerator is passed, the entity will use
     *  it to generate a new id. If nothing is passed, the entity will use
     *  the default UIDGenerator.
     */
    constructor(components = [], idOrGenerator = uid.DefaultUIDGenerator) {
        /**
         * Unique identifier of the entity.
         *
         * @member {number}
         */
        this.id = typeof idOrGenerator === 'number' ? idOrGenerator : idOrGenerator.next();

        /**
         * Systems applied to the entity.
         *
         * @number {System[]}
         */
        this.systems = [];

        /**
         * Indicate a change in components (a component was removed or added)
         * which require to re-compute entity eligibility to all systems.
         *
         * @member {boolean}
         */
        this.systemsDirty = false;

        /**
         * A reference to parent ECS class.
         *
         * @member {ECS}
         */
        this.ecs = null;

        // components initialisation
        for (let i = 0; i < components.length; ++i) {
            const component = components[i];

            this[component.name] = component.data();
        }
    }

    /**
     * Set the systems dirty flag so the ECS knows this entity needs
     * to recompute eligibility at the beginning of next tick.
     *
     */
    setSystemsDirty() {
        if (!this.systemsDirty && this.ecs) {
            this.systemsDirty = true;

            // notify to parent ECS that this entity needs to be tested next tick
            this.ecs.entitiesSystemsDirty.push(this);
        }
    }

    /**
     * Add a component to the entity.
     *
     * @param {IComponent} component - The component to add.
     */
    addComponent(component) {
        this[component.name] = component.data();
        this.setSystemsDirty();
    }

    /**
     * Remove a component from the entity. For performance reasons, we
     * set the component property to `null`. Therefore the property is
     * still enumerable after a call to `removeComponent()`.
     *
     * @param {IComponent} component - The component or name to remove.
     */
    removeComponent(component) {
        if (!this[component.name]) {
            return;
        }

        this[component.name] = null;
        this.setSystemsDirty();
    }

    /**
     * Dispose the entity.
     *
     * @private
     */
    dispose() {
        while (this.systems.length) {
            this.systems[this.systems.length - 1].removeEntity(this);
        }
    }

    /**
     * Set the parent ecs reference.
     *
     * @private
     * @param {ECS} ecs - An ECS class instance.
     */
    _addToECS(ecs) {
        this.ecs = ecs;
        this.setSystemsDirty();
    }

    /**
     * Add a system to the entity.
     *
     * @private
     * @param {System} system - The system to add.
     */
    _addSystem(system) {
        this.systems.push(system);
    }

    /**
     * Remove a system from the entity.
     *
     * @private
     * @param {System} system - The system reference to remove.
     */
    _removeSystem(system) {
        const index = this.systems.indexOf(system);

        if (index !== -1) {
            fastSplice(this.systems, index, 1);
        }
    }
}
