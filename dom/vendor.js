
/**
 * @imports
 */
import ENV from './ENV.js';

/**
 * Detects vendor type from the given ENV.window object
 * 
 * @return string
 */
export function detect() {
    if (!ENV.window) {
        return '';
    }
    // Firefox 1.0+
    var isFirefox = typeof ENV.window.InstallTrigger !== 'undefined';
    if (isFirefox) {
        return 'firefox';
    }
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(ENV.window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!ENV.window['safari'] || (typeof ENV.window.safari !== 'undefined' && ENV.window.safari.pushNotification));
    if (isSafari) {
        return 'safari';
    }
    // Chrome 1 - 79
    var isChrome = !!ENV.window.chrome && (!!ENV.window.chrome.webstore || !!ENV.window.chrome.runtime);
    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && (ENV.window.navigator.userAgent.indexOf("Edg") != -1);
    // Opera 8.0+
    var isOpera = (!!ENV.window.opr && !!ENV.window.opr.addons) || !!ENV.window.opera || ENV.window.navigator.userAgent.indexOf(' OPR/') >= 0;

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!ENV.window.document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!ENV.window.StyleMedia;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!ENV.window.CSS;
    return isEdge ? 'edge' : (
        isIE ? 'ie' : (
            isOpera ? 'opera' : (
                isEdgeChromium ? 'ie-chromium' : (
                    isChrome ? 'chrome' : 'unknown'
                )
            )
        )
    );
};

/**
 * Returns the vendor-specific property prefix.
 *
 * @return object
 */
export function prefix() {
    var styles = ENV.window.getComputedStyle(ENV.window.document.documentElement, '');
    var prefix = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.Olink === '' && ['', 'o'])[1];
    var api = (('WebKit|Moz|Ms|O').match(new RegExp('(' + prefix + ')', 'i')) || [])[1];
    return {
        api,
        prefix,
        css:'-' + prefix + '-',
    };
};
