'use strict';

var Entity = ECS.Entity;

var testComponent = {
    name: 'test',
    data() {
        return { foo: 'bar' };
    },
};

describe('Entity', () => {
    it('should initialize', () => {
        var entity = new Entity();

        expect(entity.id).to.be.a('number');
    });

    it('should have an unique id', () => {
        var entity1 = new Entity();
        var entity2 = new Entity();

        expect(entity1.id).to.be.not.equal(entity2.id);
    });

    it('should support default components', () => {
        var entity = new Entity([testComponent]);

        expect(entity.test).to.exist.and.to.be.deep.equal({ foo: 'bar' });
    });

    describe('addComponent()', () => {
        it('should add a component when passed', () => {
            var entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });
        });
    });

    describe('removeComponent()', () => {
        it('should remove a component when passed', () => {
            var entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });

            entity.removeComponent(testComponent);

            expect(entity.test).to.equal(null);
        });
    });
});
