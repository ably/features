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
 * Creates a new array populated with one or more strings, each representing a segment of a path.
 *
 * @param {string} value A single string, representing a path, with segments delimited by ': '.
 * @returns {string[]} The path segments. Will never have zero length.
 * @throws If the provided value was not a string or could not be parsed as path segments.
 */
function transformPath(value) {
  if (!isString(value)) {
    throw new Error(`Encountered value of type '${typeof value}' (${value}) when expecting a string path.`);
  }

  const segments = value.split(': ');
  segments.forEach((segment, segmentIndex) => {
    const errorContext = () => `in segment #${segmentIndex} '${segment}' when parsing path value '${value}'.`;
    const trimmed = segment.trim();
    if (trimmed.length < 1) {
      throw new Error('Empty or whitespace-only'.concat(errorContext()));
    }
    if (trimmed !== segment) {
      throw new Error('Spurious leading or trailing whitespace'.concat(errorContext()));
    }
    if (segment.includes(':')) {
      throw new Error("Illegal character ':'".concat(errorContext()));
    }
  });

  return segments;
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
  transformPath,
  transformStrings,
  transformString,
};
