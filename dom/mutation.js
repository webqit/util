
/**
 * @imports
 */
import _isString from '../js/isString.js';
import _difference from '../arr/difference.js';
import _arrFrom from '../arr/from.js';
import ready from './ready.js';

/**
 * ---------------------
 * PRESENCE
 * ---------------------
 */

/**
 * Shortcut function to onPresenceChange().
 *
 * Observes when the given elements or selectors are added
 * to the given context.
 *
 * @param window					window
 * @param array|Element|string		els
 * @param function					callback
 * @param object					params
 *
 * @return MutationObserver
 */
export function onAdded(window, els, callback, params = {}) {
	params.on = 'added';
	return onPresenceChange(window, els, (el, presence) => {
		callback(el, presence);
	}, params);
};

/**
 * Shortcut function to onPresenceChange().
 *
 * Observes when the given elements or selectors are removed
 * from the given context.
 *
 * @param window					window
 * @param array|Element|string		els
 * @param function					callback
 * @param object					params
 *
 * @return MutationObserver
 */
export function onRemoved(window, els, callback, params = {}) {
	params.on = 'removed';
	return onPresenceChange(window, els, (el, presence) => {
		callback(el, presence);
	}, params);
};

/**
 * Creates a MutationObserver that fires if currently, and whenever,
 * the given element, or selector, is present in the DOM.
 *
 * @param window						window
 * @param string|Element				selector
 * @param function						callback
 * @param object						params
 *
 * @return void
 */
export function onPresent(window, selector, callback, params = {}) {
	// On DOM-ready
	ready(window, () => {
		// On DOM mutation
		if (window.MutationObserver) {
			onAdded(window, selector, (els, presence) => {
				els.forEach(el => callback(el, presence));
			}, params);
		}
		if (_isString(selector)) {
			// IMPORTANT: This must come after having observed mutations above
			// as the callback handler may trigger more additions
			_arrFrom(window.document.querySelectorAll(selector)).forEach(el => callback(el, 1));
		} else if (selector.parentNode) {
			callback(selector, 1);
		}
	});
};

/**
 * Creates a MutationObserver that fires if currently, and whenever,
 * the given element, or selector, is absent in the DOM.
 *
 * @param window						window
 * @param string|Element				selector
 * @param function						callback
 * @param object						params
 *
 * @return void
 */
export function onAbsent(window, selector, callback, params = {}) {
	// On DOM-ready
	ready(window, () => {
		// On DOM mutation
		if (window.MutationObserver) {
			onRemoved(window, selector, (els, presence) => {
				els.forEach(el => callback(el, presence));
			}, params);
		}
		if (_isString(selector)) {
			// IMPORTANT: This must come after having observed mutations above
			// as the callback handler may trigger more removals
			if (_arrFrom(window.document.querySelectorAll(selector)).length === 0) {
				callback(null, 0);
			}
		} else if (!selector.parentNode) {
			callback(selector, 0);
		}
	});
};

/**
 * Observes when the given elements or selectors are added or removed
 * from the given context.
 *
 * @param window					window
 * @param array|Element|string		els
 * @param function					callback
 * @param object					params
 *
 * @return MutationObserver
 */
export function onPresenceChange(window, els, callback, params = {}) {
	els = _arrFrom(els, false/*castObject*/);
	var search = (el, nodeListArray) => {
		// Filter out text nodes
		nodeListArray = nodeListArray.filter(node => node.matches);
		if (_isString(el)) {
			// Is directly mutated...
			var matches = nodeListArray.filter(node => node.matches(el));
			// Is contextly mutated...
			if (params.observeIndirectMutation !== false) {
				matches = nodeListArray
					.reduce((collection, node) => collection.concat(_arrFrom(node.querySelectorAll(el))), matches);
				if (matches.length) {
					return matches;
				}
			}
		} else {
			// Is directly mutated...
			if (nodeListArray.includes(el)) {
				return [el];
			}
			// Is contextly mutated...
			if (params.observeIndirectMutation !== false && nodeListArray.length) {
				var parentNode = el;
				while(parentNode = parentNode.parentNode) {
					if (nodeListArray.includes(parentNode)) {
						return [el];
					}
				}
			}
		}
	};
	var added = [], removed = [];
	var subject = params.context || window.document.documentElement;
	var mo = new window.MutationObserver(mutations => {
		if (!params.on || params.on === 'added') {
			var matchedAddedNodes = [];
			els.forEach(el => {
				if (_isString(el)) {
					matchedAddedNodes = mutations
						.reduce((matches, mut) => matches.concat(search(el, _arrFrom(mut.addedNodes)) || []), matchedAddedNodes);
				} else {
					var matchedAsAddedNode = mutations
						.reduce((match, mut) => match || (search(el, _arrFrom(mut.addedNodes)) || [])[0], null);
					if (matchedAsAddedNode) {
						matchedAddedNodes.push(matchedAsAddedNode);
					}
				}
			});
			if (matchedAddedNodes.length) {
				if (params.onceEach) {
					var newlyadded = _difference(matchedAddedNodes, added);
					if (newlyadded.length) {
						added.push(...newlyadded);
						callback(newlyadded, 1);
					}
				} else {
					if (params.once) {
						mo.disconnect();
					}
					callback(matchedAddedNodes, 1);
				}
			}
		}
		if (!params.on || params.on === 'removed') {
			var matchedRemovedNodes = [];
			els.forEach(el => {
				if (_isString(el)) {
					matchedRemovedNodes = mutations
						.reduce((matches, mut) => matches.concat(search(el, _arrFrom(mut.removedNodes)) || []), matchedRemovedNodes);
				} else {
					var matchedAsRemovedNode = mutations
						.reduce((match, mut) => match || (search(el, _arrFrom(mut.removedNodes)) || [])[0], null);
					if (matchedAsRemovedNode) {
						matchedRemovedNodes.push(matchedAsRemovedNode);
					}
				}
			});
			if (matchedRemovedNodes.length) {
				if (params.onceEach) {
					var newlyremoved = _difference(matchedRemovedNodes, removed);
					if (newlyremoved.length) {
						removed.push(...newlyremoved);
						callback(newlyremoved, 0);
					}
				} else {
					if (params.once) {
						mo.disconnect();
					}
					callback(matchedRemovedNodes, 0);
				}
			}
		}
	});
	mo.observe(subject, {childList:true, subtree:true});
	return mo;
};

/**
 * ---------------------
 * MUTATIONS
 * ---------------------
 */

/**
 * Observes changes in attributes of the given element.
 *
 * @param window					window
 * @param Element					el
 * @param function					callback
 * @param array						filter
 *
 * @return MutationObserver
 */
export function onAttrChange(window, el, callback, filter = []) {
	var observer = new window.MutationObserver(callback);
	var params = {attributes:true, attributeOldValue:true};
	if (filter) {
		params.attributeFilter = filter;
	}
	observer.observe(el, params);
	return observer;
};

/**
 * Observes changes in tree/subtree of the given element.
 *
 * @param window					window
 * @param Element					el
 * @param function					callback
 * @param bool						subtree
 *
 * @return MutationObserver
 */
export function onTreeChange(window, el, callback, subtree = false) {
	var observer = new window.MutationObserver(callback);
	var params = {childList:true, subtree};
	observer.observe(el, params);
	return observer;
};

/**
 * Observes mutations on the given element.
 *
 * @param window					window
 * @param Element					el
 * @param function					callback
 * @param object					params
 *
 * @return MutationObserver
 */
export function onMutation(window, el, callback, params) {
	var observer = new window.MutationObserver(callback);
	observer.observe(el, params);
	return observer;
};
