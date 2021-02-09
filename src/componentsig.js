const BitField = require('../../types/bitfield');

function makeSig(field, components) {
    for(var i=0, m=components.length; i < m; i++) {
        field.set(components[i].id);
    }
}

exports = module.exports = {
    BitField,
    makeSig,
};
