const { BitField, makeSig } = require('./componentsig.js');
//const _componentList = Symbol('_componentList');

const archetypes=[];
function registerArchetype(type, list=[]) {
    const tid = archetypes.length;
    type.sig = makeSig(new BitField, list); //type.prototype[_componentList]);
    type.tid = tid;
    archetypes.push(type);
    return type;
}

function getArchetypes() {
    return archetypes;
}

exports = module.exports = {
    registerArchetype,
    getArchetypes,
    //_componentList,
};