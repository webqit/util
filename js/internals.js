/**
 * @imports
 */
import _intersect from '../arr/intersect.js';

/**
 * Creates and/or returns an "internals" object for the given object.
 * 
 * @param Any obj
 * @param String namespace
 * 
 * @return Object
 */
export default function internals(obj, ...namespaces) {
    if (!globalThis.webqit) { globalThis.webqit = {}; }
    if (!globalThis.webqit.refs) {
        Object.defineProperty(globalThis.webqit, 'refs', {value: new ObservableMap})
    }
    if (!arguments.length) return globalThis.webqit.refs;
    let itnls = globalThis.webqit.refs.get(obj);
    if (!itnls) {
        itnls = new ObservableMap;
        globalThis.webqit.refs.set(obj, itnls);
    }
    let _ns, _itnls;
    while ((_ns = namespaces.shift())) {
        if ((_itnls = itnls) && !(itnls = itnls.get(_ns))) {
            itnls = new ObservableMap;
            _itnls.set(_ns, itnls);
        }
    }
    return itnls;
}

class ObservableMap extends Map {
    constructor( ...args ) {
        super( ...args );
        this.observers = new Set;
    }
    set( key, value ) {
        let returnValue = super.set( key, value );
        this.fire( 'set', key, value, key );
        return returnValue;
    }
    delete( key ) {
        let returnValue = super.delete( key );
        this.fire( 'delete', key );
        return returnValue;
    }
    has( key ) {
        this.fire( 'has', key );
        return super.has( key );
    }
    get( key ) {
        this.fire( 'get', key );
        return super.get( key );
    }
    keyNames() { return Array.from( super.keys() ); }
    observe( type, key, callback ) {
        const entry = { type, key, callback };
        this.observers.add( entry );
        return () => this.observers.delete( entry );
    }
    unobserve( type, key, callback ) {
        if ( Array.isArray( type ) || Array.isArray( key ) ) {
            throw new Error( `The "type" and "key" arguments can only be strings.` );
        }
        for ( let entry of this.observers ) {
            if ( !( _intersection( [ type, '*' ], entry.type ) && _intersection( [ key, '*' ], entry.key ) && entry.callback === callback ) ) continue;
            this.observers.delete( entry );
        }
    }
    fire( type, key, ...args ) {
        // IMPORTANT: Array.from() must be used so that new additions to this.observers
        // during the loop aren't picked up!
        for ( let entry of this.observers ) {
            if ( !( _intersection( [ type, '*' ], entry.type ) && _intersection( [ key, '*' ], entry.key ) ) ) continue;
            entry.callback( ...args );
        }
    }
}

const _intersection = ( a, b ) => {
    if ( Array.isArray( b ) ) return _intersect( a, b ).length;
    return a.includes( b );
}
