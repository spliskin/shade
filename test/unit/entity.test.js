'use strict';

var Entity = ECS.Entity;

var testComponent = {
    name: 'test',
    data: function () { // eslint-disable-line object-shorthand
        return { foo: 'bar' };
    },
};

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

    it('should support default components', function () {
        var entity = new Entity([testComponent]);

        expect(entity.test).to.exist.and.to.be.deep.equal({ foo: 'bar' });
    });

    describe('addComponent()', function () {
        it('should add a component when passed', function () {
            var entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });
        });
    });

    describe('removeComponent()', function () {
        it('should remove a component when passed', function () {
            var entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });

            entity.removeComponent(testComponent);

            expect(entity.test).to.equal(null);
        });
    });
});
