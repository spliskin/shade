const { nextPow2 } = require('./pow2.js');

class FArray extends Array {
    constructor(capacity=4) {
        super(capacity);
        this.size = 0;
        this.length = capacity;
        this.resizepolicy = nextPow2;
    }

    resize(newsize) {
        this.length = newsize;
    }

    push(item) {
        if (this.size >= this.length)
            this.resize(this.resizepolicy(this.length));

        var idx=this.size++;
        return (this[idx] = item);
    }

    pop() {
        if (this.size < 1)
            return null;

        var item = this[--this.size];
        this[this.size]=null;
        return item;
    }

    shift() {
        if (this.size < 1)
            return null;

        return this.removeAt(0);
    }

    insert(index, obj) {
        if (index >= this.length) {
            this.resize(nextPow2(index));
        }

        this[index] = obj;
        this.size++;
    }

    removeAt(index) {
        if (index < 0 || index >= this.size)
            throw new Error("index out of range.");

        var last = this[index];
        this[index] = this[--this.size];
        this[this.size]=null;

        return last;
    }
}

exports = module.exports = FArray;