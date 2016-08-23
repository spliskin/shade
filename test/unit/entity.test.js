'use strict';

var Entity = ECS.Entity;

describe('Entity', function () {
    it('should initialize', function () {
        var entity = new Entity();

        expect(entity.id).to.be.a('number');
    });

    it('should have an unique id', function () {
        var entity1 = new Entity();
        var entity2 = new Entity();

        expect(entity1.id).to.be.not.equal(entity2.id);
    });
});
