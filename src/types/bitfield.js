
class BitField {
    constructor(nBits=32) {
        this.values = new Array(Math.max(Math.ceil(nBits/32)|0, 1));
        this.clear();
    }

    static from(other) {
        var f = new BitField(other.values.length * 32);
        for(var i=0, m=other.values.length; i < m; ++i) {
            f.values[i] = other.values[i];
        }
        return f;
    }

    clear() {
        this.values.fill(0);
    }

    get(i) {
        return (this.values[(i >> 5)] & (1 << (i & 0x1F))) !== 0;
    }

    set(i) {
        const idx = (i >> 5);
        if (idx >= this.values.length) this.resize(idx+1);
        this.values[idx] |= (1 << (i & 0x1F));
    }

    unset(i) {
        const idx = (i >> 5);
        if (idx >= this.values.length) this.resize(idx+1);
        this.values[idx] &= ~(1 << (i & 0x1F));
    }

    resize(newlength) {
        const old = this.values.length;
        this.values.length = newlength;
        this.values.fill(0, old);
        console.log(`Bitfield grew from '${old}' to '${newlength}'`);
    }

    compare(other) {
        const end = Math.min(this.values.length, other.values.length);
        var i = -1;
        while(++i < end && this.values[i] === other.values[i]);
        return (i === end);
    }

    intersection(s) {
        const max = Math.max(this.values.length, s.values.length);
        var result = new BitField(max * 32);
        for(var i=0; i < max; ++i) {
            result.values[i] = (this.values[i] || 0) & (s.values[i] || 0);
        }

        return result;
    }

    union(s) {
        const max = Math.max(this.values.length, s.values.length);
        var result = new BitField(max * 32);
        for(var i=0; i < max; ++i) {
            result.values[i] = (this.values[i] || 0) | (s.values[i] || 0);
        }

        return result;
    }

    subset(other) {
        if (this.values.length > other.values.length)
            return false;

        for(var i=0, m=this.values.length; i < m; ++i) {
            if ((this.values[i] & other.values[i]) !== this.values[i])
                return false;
        }
        return true;
    }

    difference(other) {
        var diff = new BitField(this.values.length * 32);

        for(var i=0, m=this.values.length; i < m; ++i) {
            const o = other.values[i] || 0;
            diff.values[i] = (this.values[i] ^ o) & (~o);
        }

        return diff;
    }
}

exports = module.exports = BitField;
