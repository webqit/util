import { type } from "os";

export default function wq(obj, ...namespaces) {
    if (!obj || !['object', 'function'].includes(typeof obj)) {
        throw new Error(`Argument #1 must be of type object`);
    }
    let wq = obj[Symbol.for('wq')];
    if (!wq) {
        wq = new WQInternals;
        Object.defineProperty(obj, Symbol.for('wq'), {
            value: wq,
            // Defaults, but to be explicit...
            enumerable: false,
            configurable: false,
            writable: false
        });
    }
    if (!namespaces.length) {
        return wq;
    }
    let _ns, _wq;
    while ((_ns = namespaces.shift())) {
        if ((_wq = wq) && !(wq = wq.get(_ns))) {
            wq = new WQInternals;
            _wq.set(_ns, wq);
        }
    }
    return wq;
}

class WQInternals extends Map {}