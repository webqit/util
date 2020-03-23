
/**
 * Tells if ALL items pass the test.
 *
 * @param array 	arr
 * @param function 	callback
 *
 * @return bool
 */
export default function(arr, callback) {
	return arr.reduce((prevTest, itm) => prevTest && callback(itm), true);
};
