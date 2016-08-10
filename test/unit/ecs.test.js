'use strict';

describe('ECS', () => {
    it('should initialize', () => {
        const ecs = new ECS();

        expect(ecs.entities).to.be.an('array');
        expect(ecs.systems).to.be.an('array');
    });

    describe('getEntityById()', () => {
        it('should retrieve an entity by id', () => {
            const ecs = new ECS();
            const entity = new ECS.Entity([], 123);

            ecs.addEntity(entity);

            expect(ecs.getEntityById(123)).to.be.equal(entity);
        });
    });

    describe('update()', () => {
        let ecs = null;
        let entity = null;
        let system = null;

        beforeEach(() => {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should give the elapsed time to update methods', (done) => {
            system.test = () => true;
            system.update = (entity, elapsed) => {
                expect(elapsed).to.be.a('number');
                done();
            };

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();
        });
    });

    describe('addSystem()', () => {
        let ecs = null;
        let entity = null;
        let system = null;

        beforeEach(() => {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should call enter() when update', () => {
            system.test = () => true;
            system.enter = sinon.spy();
            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            expect(system.enter.calledWith(entity)).to.be.equal(true);
        });

        it('should call enter() when removing and re-adding a system', () => {
            system.test = () => true;
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

    describe('removeSystem()', () => {
        let ecs = null;
        let entity = null;
        let system = null;

        beforeEach(() => {
            ecs = new ECS();
            entity = new ECS.Entity();
            system = new ECS.System();
        });

        it('should call exit(entity) when removed', () => {
            system.test = () => true;
            system.exit = sinon.spy();

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeSystem(system);

            expect(system.exit.calledWith(entity)).to.be.equal(true);
        });

        it('should call exit(entity) of all systems when removed', () => {
            system.test = () => true;
            system.exit = sinon.spy();

            ecs.addSystem(system);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeSystem(system);

            expect(system.exit.calledWith(entity)).to.be.equal(true);
        });
    });

    describe('removeEntity()', () => {
        let ecs = null;
        let entity = null;
        let system1 = null;
        let system2 = null;

        beforeEach(() => {
            ecs = new ECS();
            entity = new ECS.Entity();
            system1 = new ECS.System();
            system2 = new ECS.System();
        });

        it('should call exit(entity) when removed', () => {
            system1.test = () => true;
            system1.exit = sinon.spy();

            ecs.addSystem(system1);
            ecs.addEntity(entity);

            ecs.update();

            ecs.removeEntity(entity);

            expect(system1.exit.calledWith(entity)).to.be.equal(true);
        });

        it('should call exit(entity) of all systems when removed', () => {
            system2.test = () => true;
            system2.exit = sinon.spy();
            system1.test = () => true;
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
