const { nextPow2 } = require('./pow2.js');

class SparseSet extends Array {

    constructor(size=null) {
        super();
        this._sparse = [];  // Maps elements to dense indices
        this.size = 0;
        this._capacity = 0;
        this.resizepolicy = nextPow2;

        if (Array.isArray(size)) {
            for(var i=0, m=size.length; i < m; i++) {
                this.add(size[i]);
            }
        }
        else if (size > 0) {
            this.reserve(size);
        }
    }

    static from(list) {
        if (!Array.isArray(list))
            throw new Error("from requires an array");

        return new SparseSet(list);
    }

	capacity() {
        return this._capacity;
    }

	empty() {
        return this.size == 0;
    }

    clear() {
        this.size = 0;
        this.fill(null, 0);
        this._sparse.fill(null, 0);
    }

    values() {
        return this.slice(0, this.size);
    }

    _resize(arr, nsize, val=-1) {
        const at = arr.length;
        arr.length = nsize;
        arr.fill(val, at);
    }

	reserve(newsize) {
		if (newsize > this._capacity) {
			this._resize(this, newsize, null);
			this._resize(this._sparse, newsize, null);
			this._capacity = newsize;
		}
	}

    accomodate(needed) {
        const diff = this._capacity - this.size;
        if (diff < needed)
            this.reserve(this._capacity + (needed - diff));
    }

	has(val) {
		return (val < this._capacity &&
               this._sparse[val] < this.size &&
			   this[this._sparse[val]]?.id === val);
	}

    get(val) {
        if (val < this._capacity &&
            this._sparse[val] < this.size &&
            this[this._sparse[val]]?.id === val)
            return this[this._sparse[val]];
        return null;
    }

    at(idx) {
		if (idx >= 0 && idx < this.size)
		    return this[idx];

        return null;
    }

    indexOf(val) {
        if (val < this._capacity &&
            this._sparse[val] < this.size &&
            this[this._sparse[val]]?.id === val)
        {
            return this._sparse[val];
        }
        return null;
    }

	add(obj) {
        const val = obj.id;
		if (!this.has(val)) {
			if (val >= this._capacity)
                this.reserve(this.resizepolicy(val));//this.resizepolicy(this._capacity));

			this[this.size] = obj;
			this._sparse[val] = this.size;
			++this.size;
            return true;
		}
        return false;
	}

/*
    shift() {
        if (this.size() < 1)
            return null;

            const val = this[0];
            this.delete(val);
            return val;
    }

    pop() {
        if (this.size() < 1)
            return null;

        const val = this[this.size-1];
        this.delete(val);
        return val;
    }
*/
	delete(obj) {
        const val = obj.id;
		if (this.has(val)) {
            //var tmp = this[this._sparse[val]];

			this[this._sparse[val]] = this[--this.size];
			this._sparse[this[this.size]] = this._sparse[val];
            this[this.size] = this._sparse[val] = null; // clear the values (not needed really)

            // readd the value to the end outside the size, allows use as a pool
            //this[--this.size] = tmp;
            //this._sparse[val] = this.size

            return true;
		}
        return false;
	}
/*
    reuse() {
        if (this.size < this._capacity) {
            if (this[this.size] === null)
                return null;

            var val = this[this.size].id;
            this._sparse[val] = this.size;
            return this[this.size++];
        }
        return null;
    }
*/
    // check whether the set on which the  method is invoked is the subset of otherset or not
    subset(other) {
        // if size of this set is greater than otherSet then it can't be  a subset
        if (this.size > other.size)
            return false;

        for(var i=0, m=this.size; i < m; i++) {
            // if any of the element of this is not present in the otherset then return false
            if (!other.has(this[i].id))
                return false;
        }

        return true;
    }

    // Finds intersection of this set with s and returns pointer to result.
    _intersect(target, a, b) {
        for(var i=0, m=b.size; i < m; i++) {
            if (a.has(b[i].id))
                target.add(b[i]);
        }
        return target;
    }

    intersection(s) {
        if (this.size() <= s.size)
            return this._intersect(new SparseSet, this, s);

        return this._intersect(new SparseSet, s, this);
    }

    // Unifies this set and other
    union(s) {
        var set =  new SparseSet;
        for(var i=0, m=this.size; i < m; i++) {
            set.add(this[i]);
        }

        for(var i=0, m=s.size; i < m; i++) {
            set.add(s[i]);
        }

        return set;
    }

    // Performs difference operation between this set and other
    difference(other) {
        var diff = new SparseSet;

        for(var i=0, m=this.size; i < m; i++) {
            if (!other.has(this[i].id))
                diff.add(this[i]);
        }

        return diff;
    }
}

exports = module.exports = SparseSet;
