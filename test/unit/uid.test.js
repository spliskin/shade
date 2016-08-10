'use strict';

var uid = ECS.uid;

describe('uid', function () {
    it('should have a default generator', function () {
        expect(uid.DefaultUIDGenerator).to.exist;
    });

    it('should create a new generator', function () {
        var gen = new uid.UIDGenerator();

        expect(gen.salt).to.be.a('number');
        expect(gen.uidCounter).to.be.equal(0);
    });

    it('should return sequential unique ids', function () {
        var gen = new uid.UIDGenerator();
        var r1 = gen.next();
        var r2 = gen.next();

        expect(r1).to.be.a('number');
        expect(r2).to.be.a('number');
        expect(r1).to.be.not.equal('r2');
    });

    it('should return different sequences with different salts', function () {
        var gen1 = new uid.UIDGenerator(1);
        var gen2 = new uid.UIDGenerator(2);

        var r11 = gen1.next();
        var r12 = gen1.next();
        var r21 = gen2.next();
        var r22 = gen2.next();

        expect(r11).to.be.a('number');
        expect(r12).to.be.a('number');
        expect(r21).to.be.a('number');
        expect(r22).to.be.a('number');

        expect(r11).to.be.not.equal(r21);
        expect(r12).to.be.not.equal(r22);
    });

    it('should return generator with incremented salts when calling nextGenerator()', function () {
        var gen1 = uid.nextGenerator();
        var gen2 = uid.nextGenerator();

        expect(gen1.salt).to.be.a('number').and.to.be.not.equal(gen2.salt);
    });

    it('should return incremented salts when calling nextSalt()', function () {
        var salt1 = uid.nextSalt();
        var salt2 = uid.nextSalt();

        expect(salt1).to.be.a('number').and.to.be.not.equal(salt2);
    });

    describe('isSaltedBy()', function () {
        it('should return true when then id was salted with given salt', function () {
            var gen1 = new uid.UIDGenerator(1);
            var gen2 = new uid.UIDGenerator(2);

            var r1 = gen1.next();
            var r2 = gen2.next();

            expect(uid.isSaltedBy(r1, 1)).to.be.equal(true);
            expect(uid.isSaltedBy(r2, 1)).to.be.equal(false);
            expect(uid.isSaltedBy(r2, 2)).to.be.equal(true);
        });
    });
});
