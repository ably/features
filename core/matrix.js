const { compareKeys } = require('./compare');
const { Manifest } = require('./manifest');
const { isPropertyKey, Properties } = require('./sdk-node-properties');

/**
 * Abstract class (interface) implemented by users of {@link MatrixGenerator#generate}.
 *
 * Implementations of this protocol may be supplied in order to receive callbacks while inspecting the canonical feature
 * list alongside SDK manifests.
 *
 * @interface
 */
class MatrixConsumer {
  /**
   * Called first, upon encountering a feature, before any calls to {@link #onCompliance}.
   *
   * @param {string[]} parentKeys The names of the feature nodes forming the hierarchy above this feature node.
   * @param {string} key The name of this feature node.
   * @param {Properties} properties Of this feature node.
   * @param {number} maximumLevel The maximum depth, previously measured or arbitrary.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onFeature(parentKeys, key, properties, maximumLevel) {
    throw new Error('Not implemented.');
  }

  /**
   * Called one or more times, once for each manifest, for each each feature.
   *
   * @param {Properties|undefined} compliance Of the manifest's compliance node, or `undefined` if compliance not indicated.
   * @param {Manifest} manifest From which this compliance was deduced.
   * @param {Properties} featureProperties Of the feature for which this compliance applies.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onCompliance(compliance, manifest, featureProperties) {
    throw new Error('Not implemented.');
  }

  /**
   * Called last, per feature, once all calls to {@link #onCompliance} have been completed for that feature.
   */
  // eslint-disable-next-line class-methods-use-this
  onFeatureFinished() {
    throw new Error('Not implemented.');
  }

  /**
   * Called when generating if a node was encountered which hasn't been processed. Implementors should log this
   * information somewhere in case it is needed for debugging purposes.
   *
   * @param {number} level The depth within the hierarchy at which this feature node was found.
   * @param {string} description Of this feature node.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onIgnoredNode(level, description) {
    throw new Error('Not implemented.');
  }
}

/**
 * A no-op implementation of MatrixConsumer.
 *
 * @implements {MatrixConsumer}
 */
class VoidConsumer extends MatrixConsumer {
  // eslint-disable-next-line class-methods-use-this
  onFeature() { }

  // eslint-disable-next-line class-methods-use-this
  onCompliance() { }

  // eslint-disable-next-line class-methods-use-this
  onFeatureFinished() { }

  // eslint-disable-next-line class-methods-use-this
  onIgnoredNode() { }
}

class MatrixGenerator {
  /**
   * @param {Map} canonicalFeatureList The canonical feature list.
   * @param {Manifest[]} manifests In the order they're to be explored for each feature.
   */
  constructor(canonicalFeatureList, manifests) {
    this.canonicalFeatureList = canonicalFeatureList;
    this.manifests = manifests;
  }

  /**
   * Inspect the canonical tree from the root node, optionally calling the consumer as that exploration progresses.
   *
   * @param {number} maximumDepth The maximum depth, previously measured or arbitrary.
   * @param {MatrixConsumer} [consumer] To be called during the exploration.
   * @returns {number} The number of levels found.
   */
  generate(maximumDepth, consumer) {
    return generateMatrix(
      this.manifests,
      consumer ?? new VoidConsumer(),
      maximumDepth,
      [],
      this.canonicalFeatureList,
    );
  }
}

/**
 * Inspect a node, and it's children, optionally rendering to table rows.
 *
 * @param {Manifest[]} manifests In the order they're to be explored for each feature.
 * @param {MatrixConsumer} consumer Call during the generation process.
 * @param {number} maximumLevel The maximum depth, previously measured or arbitrary.
 * @param {string[]} parentKeys Parent keys, also indicating the depth of this node. Nodes at root have an empty array.
 * @param {*} node The canonical feature node.
 * @returns {number} The number of levels, including this node and its children.
 */
function generateMatrix(manifests, consumer, maximumLevel, parentKeys, node) {
  const level = parentKeys.length;
  if (level > maximumLevel) {
    throw new Error(`Maximum depth limit exceeded (${maximumLevel}).`);
  }

  let maximumDepth = 0;
  if (node instanceof Map) {
    const sortedKeys = Array.from(node.keys()).sort(compareKeys);
    sortedKeys.forEach((key) => {
      const value = node.get(key);
      if (!isPropertyKey(key)) {
        const properties = new Properties(value);

        consumer.onFeature(parentKeys, key, properties, maximumLevel);
        manifests.forEach((manifest) => {
          const compliance = manifest.find([...parentKeys, key]);
          consumer.onCompliance(compliance, manifest, properties);
        });
        consumer.onFeatureFinished();

        const depth = generateMatrix(manifests, consumer, maximumLevel, [...parentKeys, key], value);
        maximumDepth = Math.max(maximumDepth, 1 + depth);
      }
    });
  } else if (Array.isArray(node)) {
    node.forEach((element) => {
      const depth = generateMatrix(manifests, consumer, maximumLevel, parentKeys, element);
      maximumDepth = Math.max(maximumDepth, depth);
    });
  } else if (node instanceof String || typeof node === 'string') {
    if (consumer) {
      consumer.onIgnoredNode(level, `${node}`);
    }
    maximumDepth = 1;
  } else if (node === null) {
    // the value for a key with no value defined
  } else if (consumer) {
    // informational only, while debugging
    consumer.onIgnoredNode(level, `${typeof node} = ${node}`);
  }

  return maximumDepth;
}

module.exports = {
  MatrixGenerator,
  MatrixConsumer,
};
