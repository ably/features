/**
 * Compares two string keys, using our preferred comparison method.
 *
 * This method uses `localCompare` with the `sensitivity` option set to 'base',
 * meaning that comparisons are case insensitive.
 *
 * @param {string} a The first string (a.k.a. `referenceStr`).
 * @param {string} b The second string (a.k.a. `compareString`).
 * @returns {number} A negative number if `a` occurs before `b`;
 * positive if the `a` occurs after `b`; 0 if they are equivalent.
 */
function compareKeys(a, b) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

module.exports = {
  compareKeys,
};
