function nearestPow2(n) {
    return 1 << 31 - Math.clz32(n);
}

function nextPow2(n) {
    n = (n >>> 0) & ~1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;

    return n+1;
}

function doubleit(capacity) {
    return (capacity*2) || 1;
}

exports = module.exports = {
    nearestPow2,
    nextPow2,
    doubleit,
};