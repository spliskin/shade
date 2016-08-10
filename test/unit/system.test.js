'use strict';

var System = ECS.System;

function getFakeEntity() {
    return {
        _addSystem: sinon.spy(),
        _removeSystem: sinon.spy(),
    };
}

describe('System', function () {
    it('should initialize', function () {
        var system = new System();

        expect(system).to.exist;
    });

    describe('addEntity()', function () {
        var entity = null;
        var system = null;

        beforeEach(function () {
            entity = getFakeEntity();
            system = new System();
        });

        it('should add an entity to the system', function () {
            system.addEntity(entity);

            expect(system.entities.length).to.be.equal(1);
        });

        it('should add the system to entity systems', function () {
            system.addEntity(entity);

            expect(entity._addSystem.calledWith(system)).to.be.equal(true);
        });

        it('should call enter() on added entity', function () {
            system.enter = sinon.spy();

            system.addEntity(entity);

            expect(system.enter.calledWith(entity)).to.be.equal(true);
        });
    });

    describe('removeEntity()', function () {
        var entity = null;
        var system = null;

        beforeEach(function () {
            entity = getFakeEntity();
            system = new System();

            system.addEntity(entity);
        });

        it('should remove an entity from the system', function () {
            system.removeEntity(entity);

            expect(system.entities.length).to.be.equal(0);
        });

        it('should remove the system from entity systems', function () {
            system.removeEntity(entity);

            expect(entity._removeSystem.calledWith(system)).to.be.equal(true);
        });

        it('should call exit() on removed entity', function () {
            system.exit = sinon.spy();

            system.removeEntity(entity);

            expect(system.exit.calledWith(entity)).to.be.equal(true);
        });
    });

    describe('updateAll()', function () {
        it('should call update() on each entity', function () {
            var entity1 = getFakeEntity();
            var entity2 = getFakeEntity();
            var system = new System();

            system.update = sinon.spy();

            system.addEntity(entity1);
            system.addEntity(entity2);
            system.updateAll();

            expect(system.update.calledTwice).to.be.equal(true);
            expect(system.update.calledWith(entity1)).to.be.equal(true);
            expect(system.update.calledWith(entity2)).to.be.equal(true);
        });

        it('should call preUpdate()', function () {
            var system = new System();

            system.preUpdate = sinon.spy();

            system.updateAll();

            expect(system.preUpdate.called).to.be.equal(true);
        });

        it('should call postUpdate()', function () {
            var system = new System();

            system.postUpdate = sinon.spy();

            system.updateAll();

            expect(system.postUpdate.called).to.be.equal(true);
        });
    });
});
