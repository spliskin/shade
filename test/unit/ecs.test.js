'use strict';

describe('ECS', function () {
    it('should initialize', function () {
        var ecs = new ECS();

        expect(ecs.entities).to.be.an('array');
        expect(ecs.systems).to.be.an('array');
    });

    describe('getEntityById()', function () {
        it('should retrieve an entity by id', function () {
            var ecs = new ECS();
            var entity = new ECS.Entity([], 123);

            ecs.addEntity(entity);

            expect(ecs.getEntityById(123)).to.be.equal(entity);
        });
    });

    describe('update()', function () {
        var ecs = null;
        var entity = null;
        var system = null;

        beforeEach(function () {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should give the elapsed time to update methods', function (done) {
            system.test = function () { return true }; // eslint-disable-line
            system.update = function (entity, elapsed) {
                expect(elapsed).to.be.a('number');
                done();
            };

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();
        });
    });

    describe('addSystem()', function () {
        var ecs = null;
        var entity = null;
        var system = null;

        beforeEach(function () {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should call enter() when update', function () {
            system.test = ()function () { return true; } // eslint-disable-line
            system.enter = sinon.spy();
            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            expect(system.enter.calledWith(entity)).to.be.equal(true);
        });

        it('should call enter() when removing and re-adding a system', function () {
            system.test = ()function () { return true; } // eslint-disable-line
            system.enter = sinon.spy();
            ecs.addSystem(system);
            ecs.addEntity(entity);
            ecs.update();

            ecs.removeSystem(system);
            ecs.update();

            ecs.addSystem(system);
            ecs.update();

            expect(system.enter.calledTwice).to.be.equal(true);
        });
    });

    describe('removeSystem()', function () {
        var ecs = null;
        var entity = null;
        var system = null;

        beforeEach(function () {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should call exit(entity) when removed', function () {
            system.test = ()function () { return true; } // eslint-disable-line
            system.exit = sinon.spy();

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeSystem(system);

            expect(system.exit.calledWith(entity)).to.be.equal(true);
        });

        it('should call exit(entity) of all systems when removed', function () {
            system.test = ()function () { return true; } // eslint-disable-line
            system.exit = sinon.spy();

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeSystem(system);

            expect(system.exit.calledWith(entity)).to.be.equal(true);
        });
    });

    describe('removeEntity()', function () {
        var ecs = null;
        var entity = null;
        var system1 = null;
        var system2 = null;

        beforeEach(function () {
            ecs = new ECS();
            entity = new ECS.Entity();
            system1 = new ECS.System();
            system2 = new ECS.System();
        });

        it('should call exit(entity) when removed', function () {
            system1.test = ()function () { return true; } // eslint-disable-line
            system1.exit = sinon.spy();

            ecs.addSystem(system1);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeEntity(entity);

            expect(system1.exit.calledWith(entity)).to.be.equal(true);
        });

        it('should call exit(entity) of all systems when removed', function () {
            system2.test = ()function () { return true; } // eslint-disable-line
            system2.exit = sinon.spy();
            system1.test = ()function () { return true; } // eslint-disable-line
            system1.exit = sinon.spy();

            ecs.addSystem(system1);
            ecs.addSystem(system2);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeEntity(entity);

            expect(system1.exit.calledWith(entity)).to.be.equal(true);
            expect(system2.exit.calledWith(entity)).to.be.equal(true);
        });
    });
});
