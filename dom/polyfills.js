
/**
 * Applies all supported polyfills
 */
export default function(window) {
    CSS_escape(window);
    Element_matches(window);
};

/**
 * Polyfills the window.CSS object.
 *  
 * @return void
 */
export function CSS_escape(window) {
    if (!window.CSS) {
        window.CSS = {};
    }
    if (!window.CSS.escape) {
        /**
         * Polyfills the window.CSS.escape() function.
         *  
         * @param string str 
         * 
         * @return string
         */
        window.CSS.escape = str => str.replace(/([\:@\~\$\&])/g, '\\$1');
    }
};

/**
 * Polyfills the Element.prototype.matches() method
  *  
 * @return void
*/
export function Element_matches(window) {
    if (!window.Element.prototype.matches) {
        window.Element.prototype.matches = 
        window.Element.prototype.matchesSelector || 
        window.Element.prototype.mozMatchesSelector ||
        window.Element.prototype.msMatchesSelector || 
        window.Element.prototype.oMatchesSelector || 
        window.Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
    }
}; 

/**
 * Queries a DOM context for elements matching
 * the given selector.
 *
 * @param window 				window
 * @param string 				selector
 * @param document|Element	    context
 * @param bool		 			all
 *
 * @return Element|DOMNodeList
 */
export function querySelector(window, selector, context = null, all = false) {
    context = context || window.document;
	var matchedItems, method = all ? 'querySelectorAll' : 'querySelector';
	try {
		matchedItems = context[method](selector);
	} catch(e) {
		try {
			matchedItems = context[method](selector.replace(/\:is\(/g, ':matches('));
		} catch(e) {
			try {
				matchedItems = context[method](selector.replace(/\:is\(/g, ':-webkit-any('));
			} catch(e) {
				try {
					matchedItems = context[method](selector.replace(/\:is\(/g, ':-moz-any('));
				} catch(e) {
					throw e;
				}
			}
		}
	}
	return matchedItems;
};

/**
 * Queries a DOM context for elements matching
 * the given selector.
 *
 * @param string 				selector
 * @param document|Element	    context
 *
 * @return DOMNodeList
 */
export function querySelectorAll(window, selector, context = window.document) {
    return querySelector(selector, context, true);
};
