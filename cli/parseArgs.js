
/**
 * @imports
 */
import _arrLast from '../arr/last.js';
import _arrFrom from '../arr/from.js';

/**
 * Parses command-line args to a more-usable format
 * 
 * @param array args
 * 
 * @return object
 */
export default function(argv) {
    var command = argv[2], _flags = argv.slice(3), flags = {}, ellipsis;
    if (_arrLast(_flags) === '...') {
        _flags.pop();
        ellipsis = true;
    }
    _flags.forEach(flag => {
        if (flag.indexOf('+=') > -1 || flag.indexOf('=') > -1 || flag.startsWith('#')) {
            if (flag.indexOf('+=') > -1) {
                flag = flag.split('+=');
                var flag_name = flag[0].toUpperCase();
                flags[flag_name] = _arrFrom(flags[flag_name]);
                flags[flag_name].push(flag[1]);
            } else {
                flag = flag.split('=');
                var flag_name = flag[0].toUpperCase();
                flags[flag_name] = flag[1] === 'TRUE' ? true : (flag[1] === 'FALSE' ? false : flag[1]);
            }
        } else if (flag.startsWith('--')) {
            flags[flag.substr(2).toUpperCase()] = true;
        }
    });
    return {
        command,
        flags,
        _flags,
        ellipsis,
    }
};