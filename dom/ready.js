
/**
 * @imports
 */
import ENV from './ENV.js';

// ------------------
// ready
// ------------------
var readyCallbacks = [];
export default function(callback) {
    if (ENV.window.document.readyState === 'complete') {
		callback();
    } else {
		readyCallbacks.push(callback);
	}
    ENV.window.document.addEventListener('DOMContentLoaded', () => {
		readyCallbacks.forEach(callback => callback());
		readyCallbacks.splice(0);
	}, false);
};