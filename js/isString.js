
/**
 * Tells if val is of type "string".
 *
 * @param string 	val
 *
 * @return bool
 */
export default function(val) {
	return typeof val === 'string' && val !== null;
};
