const { BitField, makeSig } = require('./componentsig.js');
const _cachedApplicationRef = Symbol('_cachedApplicationRef');
const _componentList = Symbol('_componentList');
const _mixinRef = Symbol('_mixinRef');

class Entity {
    constructor() {
        this.id = -1;
        this.ecs = null;
    }

    hasComponents(...components) {
        // checks the signature for every component in list, if one doesn't exist, immediately returns false
        var i=-1;
        while(++i < components.length) {
            if (!this.sig.get(components[i].id))
                return false;
        }
        return components.length > 0;
    }

    dispose() {}
}

Entity.prototype.hasComponent = Entity.prototype.hasComponents;
Entity.prototype.sig = new BitField(32);

/**
 * Composes an entity with the given components.
 *
 * @example
 *
 * ```js
 * class MyEntity extends ECS.Entity.with(Component1, Component2, ...) {
 * }
 * ```
 *
 * @static
 * @param {...Component} components - The component classes to compose into a parent class.
 * @return {Component} A base-class component to extend from.
 */
Entity.with = function entityWith(...components) {
    const Clazz = components.reduce((base, comp) => {
        // Get or create a symbol used to look up a previous application of mixin
        // to the class. This symbol is unique per mixin definition, so a class will have N
        // applicationRefs if it has had N mixins applied to it. A mixin will have
        // exactly one _cachedApplicationRef used to store its applications.
        let ref = comp[_cachedApplicationRef];

        if (!ref) {
            ref = comp[_cachedApplicationRef] = Symbol(comp.name);
        }

        // look up cached version of mixin/superclass
        if (Object.prototype.hasOwnProperty.call(base, ref)) {
            return base[ref];
        }

        // apply the component
        const app = comp(base);

        // cache it so we don't make it again
        base[ref] = app;

        // store the mixin we applied here.
        app.prototype[_mixinRef] = comp;

        return app;
    }, this);

    Clazz.sig = makeSig(new BitField(32), components);


    Clazz.prototype[_componentList] = components;

    return Clazz;
};

// export some symbols
Entity._cachedApplicationRef = _cachedApplicationRef;
Entity._componentList = _componentList;

exports = module.exports = Entity;
