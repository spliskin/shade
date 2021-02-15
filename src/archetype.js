const { BitField, makeSig, _componentsort } = require('./componentsig.js');
//const _componentList = Symbol('_componentList');

const archetypes=[];
function registerArchetypes(...list) {
    for(var i=0, m=list.length; i < m; ++i) {
        const type = list[i];
        type.tid = archetypes.length;
        archetypes.push(type);
    }
}

function getArchetypes() {
    return archetypes;
}

exports = module.exports = {
    registerArchetypes,
    getArchetypes,
    BitField,
    makeSig,
    _componentsort,
};