
// ------------------
// ready
// ------------------
export default function(window, callback) {
	if (!window.__readyCallbacks) {
		window.__readyCallbacks = [];
	}
    if (window.document.readyState === 'complete') {
		callback();
    } else {
		window.__readyCallbacks.push(callback);
	}
    window.document.addEventListener('DOMContentLoaded', () => {
		window.__readyCallbacks.forEach(callback => callback());
		window.__readyCallbacks.splice(0);
	}, false);
};