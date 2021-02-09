const BitField = require('./types/bitfield.js');

function makeSig(field, components) {
    for(var i=0, m=components.length; i < m; i++) {
        field.set(components[i].id);
    }
    return field;
}

exports = module.exports = {
    BitField,
    makeSig,
};
