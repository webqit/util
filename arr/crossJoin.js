
/**
 * @imports
 */
import _arrFrom from './from.js';

/**
 * Accepts a list of column and joins them to a table.
 *
 * @param array 	arr
 *
 * @return number
 */
export default function(arr) {
	return arr.reduce((currTable, column) => {
		var newTable = [];
		currTable.forEach(row => {
			_arrFrom(column).forEach(column => {
				var _row = row.slice();
				_row.push(column);
				newTable.push(_row);
			});
		});
		return newTable;
	}, [[]]);
};