
/**
 * @imports
 */
import ENV from './ENV.js';

/**
 * Applies all supported polyfills
 */
export default function() {
    CSS_escape();
    Element_matches();
};

/**
 * Polyfills the window.CSS object.
 *  
 * @return void
 */
export function CSS_escape(str) {
    if (!ENV.window.CSS) {
        ENV.window.CSS = {};
    }
    if (!ENV.window.CSS.escape) {
        /**
         * Polyfills the window.CSS.escape() function.
         *  
         * @param string str 
         * 
         * @return string
         */
        ENV.window.CSS.escape = str => str.replace(/([\:@\~\$\&])/g, '\\$1');
    }
};

/**
 * Polyfills the Element.prototype.matches() method
  *  
 * @return void
*/
export function Element_matches() {
    if (!ENV.window.Element.prototype.matches) {
        ENV.window.Element.prototype.matches = 
        ENV.window.Element.prototype.matchesSelector || 
        ENV.window.Element.prototype.mozMatchesSelector ||
        ENV.window.Element.prototype.msMatchesSelector || 
        ENV.window.Element.prototype.oMatchesSelector || 
        ENV.window.Element.prototype.webkitMatchesSelector ||
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
 * @param string 				selector
 * @param document|Element	    context
 * @param bool		 			all
 *
 * @return Element|DOMNodeList
 */
export function querySelector(selector, context = ENV.window.document, all = false) {
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
export function querySelectorAll(selector, context = ENV.window.document) {
    return querySelector(selector, context, true);
};
