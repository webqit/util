
/**
 * @imports
 */
import _each from '../obj/each.js';
import ENV from './ENV.js';

/**
 * ---------------------------
 * Binds callbacks to requestAnimationFrame()
 * to create a central "read/write" phases for DOM access.
 * ---------------------------
 */
			
const Reflow = {
	
	/**
	 * Holds all callbacks bound to the "read" phase.
	 *
	 * @var array
	 */
	readCallbacks: [],
	
	/**
	 * Holds all callbacks bound to the "write" phase.
	 *
	 * @var array
	 */
	writeCallbacks: [],

	/**
	 * Starts the loop.
	 *
	 * @return this
	 */
	_run: function() {
		ENV.window.requestAnimationFrame(() => {
			Reflow.readCallbacks.forEach((callback, i) => {
				if (callback && !callback()) {
					Reflow.readCallbacks[i] = null;
				}
			});
			Reflow.writeCallbacks.forEach((callback, i) => {
				if (callback && !callback()) {
					Reflow.writeCallbacks[i] = null;
				}
			});
			Reflow._run();
		});
	},
	
	/**
	 * Binds a callback to the "read" phase.
	 *
	 * @param function 	callback
	 * @param bool		withPromise
	 *
	 * @return void
	 */
	onread: function(callback, withPromise = false) {
		if (withPromise) {
			return new Promise((resolve, reject) => {
				if (ENV.reflow === false) {
					callback(resolve, reject);
				} else {
					Reflow.readCallbacks.push(() => {
						callback(resolve, reject);
					});
				}
			});
		}
		if (ENV.reflow === false) {
			callback();
		} else {
			Reflow.readCallbacks.push(callback);
		}
	},
	
	/**
	 * Binds a callback to the "write" phase.
	 *
	 * @param function 	callback
	 * @param bool		withPromise
	 *
	 * @return void
	 */
	onwrite: function(callback, withPromise = false) {
		if (withPromise) {
			return new Promise((resolve, reject) => {
				if (ENV.reflow === false) {
					callback(resolve, reject);
				} else {
					Reflow.writeCallbacks.push(() => {
						callback(resolve, reject);
					});
				}
			});
		}
		if (ENV.reflow === false) {
			callback();
		} else {
			Reflow.writeCallbacks.push(callback);
		}
	},
	
	/**
	 * A special construct for DOM manipulations that span
	 * one or more read/write cycles.
	 *
	 * @param function 	read
	 * @param function 	write
	 * @param mixed		prevTransaction
	 *
	 * @return void|mixed
	 */
	cycle: function(read, write, prevTransaction) {
		Reflow.onread(() => {
			// Record initial values
			var readReturn = read(prevTransaction);
			if (readReturn) {
				// Call erite, the transation
				var callWrite = (readReturn) => {
					Reflow.onwrite(() => {
						var writeReturn = write(readReturn, prevTransaction);
						if (writeReturn) {
							// Repeat transaction
							var repeatTransaction = (writeReturn) => {
								Reflow.cycle(read, write, writeReturn);
							};
							// ---------------------------------------
							// If "write" returns a promise, we wait until it is resolved
							// ---------------------------------------
							if (writeReturn instanceof ENV.window.Promise) {
								writeReturn.then(repeatTransaction);
							} else {
								repeatTransaction();
							}
						}
					});
				};
				// ---------------------------------------
				// If "read" returns a promise, we wait until it is resolved
				// ---------------------------------------
				if (readReturn instanceof ENV.window.Promise) {
					readReturn.then(callWrite);
				} else {
					callWrite();
				}
			}
		});
	},
};

/**
 * @exports
 */
export default Reflow;