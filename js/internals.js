
/**
 * Creates and/or returns an "internals" object for the given object.
 * 
 * @param Any obj
 * @param String namespace
 * 
 * @return Object
 */
const InternalsRegistry = new Map;
export default function internals(obj, ...namespaces) {
    var itnls = InternalsRegistry.get(obj);
    if (!itnls) {
        itnls = new Map;
        InternalsRegistry.set(obj, itnls);
    }
    var _ns, _itnls;
    while ((_ns = namespaces.shift())) {
        if ((_itnls = itnls) && !(itnls = itnls.get(_ns))) {
            itnls = new Map;
            _itnls.set(_ns, itnls);
        }
    }
    return itnls;
}