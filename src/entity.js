const {
    registerArchetype,
    //_componentList
} = require('./archetype.js');
const _cachedApplicationRef = Symbol('_cachedApplicationRef');
const _mixinRef = Symbol('_mixinRef');

class Entity {
    // export some symbols
    //static _cachedApplicationRef = _cachedApplicationRef;
    //static _componentList = _componentList;

    get tid() { return this.constructor.tid; }
    get sig() { return this.constructor.sig; }

    constructor(ecs=null, id=-1) {
        this.id = id;
        this.ecs = ecs;
    }

    hasComponent(component) {
        return this.sig.get(component.id);
    }

    hasComponents(...components) {
        // checks the signature for every component in list, if one doesn't exist, immediately returns false
        var i=0;
        const sig = this.sig;
        while(i < components.length && sig.get(components[i++].id));
        //{
        //    if (!sig.get(components[i++].id))
        //        return false;
        //}
        return components.length > 0 && i >= components.length;
    }

    static with(...components) {
        let Clazz = null;
        let base = Object(this);
        for(var i=0, m=components.length; i < m; i++) {
            const comp = components[i];

            if (!comp[_cachedApplicationRef])
                comp[_cachedApplicationRef] = Symbol(comp.name);

            let ref = comp[_cachedApplicationRef];

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
        //Clazz.prototype[_componentList] = components;
        registerArchetype(Clazz, components);

        return Clazz;
    }

    //reset() {}
}

registerArchetype(Entity);

exports = module.exports = Entity;
