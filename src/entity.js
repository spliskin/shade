const { registerArchetypes, BitField, makeSig, _componentsort } = require('./archetype.js');
const SparseSet = require('./types/sparseset.js');
const _cachedApplicationRef = Symbol('_cachedApplicationRef');
const _mixinRef = Symbol('_mixinRef');

class Entity {
    static sig = new BitField;

    // export some symbols
    get tid() { return this.constructor.tid; }
    get sig() { return this.constructor.sig; }

    constructor(ecs=null, id=-1) {
        this.id = id;
        this.ecs = ecs;
        this.systems = new SparseSet;
    }

    hasComponent(component) {
        return this.sig.get(component.id);
    }

    hasComponents(...components) {
        // checks the signature for every component in list, if one doesn't exist, immediately returns false
        for(var i=0, m=components.length; i < m && this.sig.get(components[i].id); ++i);
        return components.length > 0 && i >= components.length;
    }

    reset() {}

    dispose() {
        while (this.systems.size) {
            this.systems[this.systems.size - 1].removeEntity(this);
        }
    }

    _addSystem(system) {
        this.systems.add(system);
    }

    _removeSystem(system) {
        this.systems.delete(system);
    }

    static with(...components) {
        var Clazz = null,
            base = Object(this);

        components.sort(_componentsort);

        for(var i=0, m=components.length; i < m; i++) {
            const comp = components[i];
            if (!comp[_cachedApplicationRef])
                comp[_cachedApplicationRef] = Symbol(comp.name);

            const ref = comp[_cachedApplicationRef];

            // look up cached version of mixin/superclass
            if (Object.prototype.hasOwnProperty.call(base, ref)) {
                base = base[ref];
                continue;
            }

            // apply the component
            const app = comp(base);

            // cache it so we don't make it again
            base[ref] = app;

            // store the mixin we applied here.
            app.prototype[_mixinRef] = comp;

            base = app;
        }

        Clazz = base;
        Clazz.sig = makeSig(BitField.from(base.sig), components)

        return Clazz;
    }

}

registerArchetypes(Entity);

exports = module.exports = Entity;
