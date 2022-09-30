const IDENTITY_TRANSFORM = (value) => value;

/**
 * Callback transforming a string.
 *
 * @callback StringTransformer
 * @param {string} value The string to be transformed.
 * @returns {*} The result of transforming the string.
 */

/**
 * Creates a new array populated with the results of calling a provided function with one
 * or more string values.
 *
 * Supported Translations:
 * - string => [string]
 * - [string1, string2] => [string1, string2]
 *
 * @param {string|string[]} value A single string, or an array of strings.
 * @param {StringTransformer} transformer A function to be called with each string.
 * @returns {*[]} The results of transforming the string(s).
 * @throws If no values were provided or some values were not strings.
 */
function transformStrings(value, transformer) {
  if (value === null || value === undefined) {
    throw new Error('The value may not be null or undefined.');
  }
  const array = Array.isArray(value) ? value : [value];
  if (array.length < 1) {
    throw new Error('No values to transform.');
  }
  return array.map((element) => transformString(element, transformer));
}

/**
 * Returns the result of calling a provided function with a string value.
 *
 * @param {string} value A single string.
 * @param {StringTransformer} transformer A function to be called with the string.
 * @returns {*} The result of transforming the string.
 * @throws If the value provided is not a string.
 */
function transformString(value, transformer) {
  if (value instanceof String || typeof value === 'string') {
    return transformer(value);
  }
  throw new Error(`Encountered '${typeof value}' (${value}) when expecting a string.`);
}

module.exports = {
  IDENTITY_TRANSFORM,
  transformStrings,
  transformString,
};
