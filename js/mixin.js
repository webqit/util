
/**
 * @imports
 */
import _isArray from './isArray.js';
import _isFunction from './isFunction.js';
import _arrLast from '../arr/last.js';
import _mergeCallback from '../obj/mergeCallback.js';
import _each from '../obj/each.js';

/**
 * A multi-inheritance implementstion.
 *
 * @param array	 	...classes
 *
 * @return object
 */
export default function(...classes) {
	
	var Traps = {};
	var RetrnDirective = 'last';
	if (_isArray(arguments[0])) {
		classes = arguments[0];
		Traps = arguments[1];
		if (arguments[2]) {
			RetrnDirective = arguments[2];
		}
	}
	var Base = _arrLast(classes);
	var supersMap = {};
	var Mixin = class extends Base {
		constructor(...args) {
			super(...args);
		}
	};
	// A trap for _instanceof()
	Mixin.prototypes = classes;
	// ---------------------
	// Extend (merge) properties but keep methods
	classes.forEach(_class => {
		// Copy const members
		_mergeCallback([Mixin, _class], (key, obj1, obj2) => ['name', 'prototype', 'prototypes', 'length'].indexOf(key) === -1);
		_mergeCallback([Mixin.prototype, _class.prototype], (key, obj1, obj2) => {
			if (['prototype', 'prototypes'].indexOf(key) === -1) {
				if (_isFunction(obj2[key])) {
					if (_isArray(supersMap[key])) {
						supersMap[key].push(obj2[key]);
					} else {
						supersMap[key] = [obj2[key]];
					}
					return false;
				}
				return true;
			}
			return false;
		}, true/*deepProps*/);
	});
	// Extend (proxy) methods
	_each(supersMap, (name, supers) => {
		if (name === 'constructor') {
			return;
		}
		// NOTE: this must not be defined as an arrow function
		// for the benefit of the "this".
		Mixin.prototype[name] = function(...args) {
			if (Object.hasOwnProperty(Traps, name) && _isFunction(Traps[name])) {
				// Wrap a call to the trap...
				// So mixin supers are passed to traps
				return Traps[name].call(this, supers, ...args);
			} else {
				// Call each super and return
				// the last one's return value
				var supersReturnValues = [];
				supers.forEach(supr => {
					supersReturnValues.push(supr.call(this, ...args));
				})
				return _arrLast(supersReturnValues);
			}
		};
	});
	return Mixin;
};
