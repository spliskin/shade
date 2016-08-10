'use strict';

const Entity = ECS.Entity;

const testComponent = {
    name: 'test',
    data() {
        return { foo: 'bar' };
    },
};

describe('Entity', () => {
    it('should initialize', () => {
        const entity = new Entity();

        expect(entity.id).to.be.a('number');
    });

    it('should have an unique id', () => {
        const entity1 = new Entity();
        const entity2 = new Entity();

        expect(entity1.id).to.be.not.equal(entity2.id);
    });

    it('should support default components', () => {
        const entity = new Entity([testComponent]);

        expect(entity.test).to.exist.and.to.be.deep.equal({ foo: 'bar' });
    });

    describe('addComponent()', () => {
        it('should add a component when passed', () => {
            const entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });
        });
    });

    describe('removeComponent()', () => {
        it('should remove a component when passed', () => {
            const entity = new Entity();

            entity.addComponent(testComponent);

            expect(entity.test).to.deep.equal({ foo: 'bar' });

            entity.removeComponent(testComponent);

            expect(entity.test).to.equal(null);
        });
    });
});
