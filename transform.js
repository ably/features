const IDENTITY_TRANSFORM = (value) => value;

const isString = (value) => value instanceof String || typeof value === 'string';

/**
 * Callback transforming a string.
 *
 * @callback StringTransformer
 * @param {string} value The string to be transformed.
 * @returns {*} The result of transforming the string.
 */

/**
 * Creates a new array populated with arrays containing the results of calling a provided function with one
 * or more string values, or arrays of string values.
 *
 * Supported Translations:
 * - string => [[string]]
 * - [string1, string2] => [[string1, string2]]
 * - [[string1], [string2, string3]] => [[string1], [string2, string3]]
 * - [string1, [string2, string3]] => [[string1], [string2, string3]]
 * - [string1, [string2], [string3, string4]] => [[string1], [string2], [string3, string4]]
 *
 * @param {string|string[]|string[][]} value A single string, or an array of strings, or an array of arrays of strings.
 * @param {StringTransformer} transformer A function to be called with each string.
 * @returns {*[][]} The results of transforming the string(s).
 * @throws If no values were provided or some values were not strings or arrays, as appropriate.
 */
function transformPaths(value, transformer) {
  if (value === null || value === undefined) {
    throw new Error('The value may not be null or undefined.');
  }
  const array = Array.isArray(value) ? value : [value];
  if (array.length < 1) {
    throw new Error('No values to transform.');
  }

  if (array.every(isString)) {
    // It's most logical, as a feature node path, for [a, b] => [[a, b]] // a.k.a. 'a: b' (path).
    // Hence this special case for when there's only one array present.
    return [transformStrings(array, transformer)];
  }

  return array.map((element) => transformStrings(element, transformer));
}

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
  if (isString(value)) {
    return transformer(value);
  }
  throw new Error(`Encountered '${typeof value}' (${value}) when expecting a string.`);
}

module.exports = {
  IDENTITY_TRANSFORM,
  transformPaths,
  transformStrings,
  transformString,
};
