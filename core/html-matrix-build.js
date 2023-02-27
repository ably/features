const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const { Manifest } = require('./manifest');
const { MatrixGenerator } = require('./matrix');
const { writeDocument } = require('./html-matrix-renderer');
const { validateStructure } = require('./yaml-structure');
const { isString } = require('./transform');

const loadSource = (filePath) => fs.readFileSync(filePath).toString();
const yamlParserOptions = { mapAsMap: true };

class ManifestObjects {
  /**
   * Loads SDK feature compliance manifest(s) from YAML file(s).
   *
   * @param {string[]} suffixes In the order they're to be explored for each feature.
   * @param {Map} sourcePaths The paths to the YAML documents containing SDK manifests, keyed by suffix.
   */
  constructor(suffixes, sourcePaths) {
    if (!suffixes || suffixes.length < 1) {
      throw new Error('suffixes must be defined and not empty.');
    }
    if ((new Set(suffixes)).size !== suffixes.length) {
      throw new Error('Values in suffixes must all be unique (array as ordered set).');
    }
    if (suffixes.length !== sourcePaths.size) {
      throw new Error('suffixes.length must match sourcePaths.size.');
    }

    // Load YAML sources up-front and do first-pass (first parse) structural validation.
    const sources = new Map();
    suffixes.forEach((suffix) => {
      const source = loadSource(sourcePaths.get(suffix));
      validateStructure(YAML.parseDocument(source).contents);
      sources.set(suffix, source);
    });

    // Do second-pass (second parse) parsing raw YAML sources to JS objects.
    const objects = new Map();
    sources.forEach((source, suffix) => {
      try {
        const object = YAML.parse(source, yamlParserOptions);
        objects.set(suffix, object);
      } catch (error) {
        throw new Error(
          `Failed YAML parse for manifest with ${suffix}.`,
          { cause: error },
        );
      }
    });

    // Ensure that all objects contain a top-level key with a value indicating the
    // version of the canonical feature list to which this manifest aligns.
    let commonVersion;
    objects.forEach((object, suffix) => {
      try {
        if (!(object instanceof Map)) {
          throw new Error('manifest must be a Map.');
        }
        const version = object.get('common-version');
        if (!isString(version)) {
          throw new Error('common-version must be a string.');
        }
        if (version.trim().length < 1) {
          throw new Error('common-version may not be empty.');
        }
        if (commonVersion) {
          if (commonVersion !== version) {
            throw new Error(`common-version '${version}' must match '${commonVersion}' from previously processed manifests.`);
          }
        } else {
          commonVersion = version;
        }
      } catch (error) {
        throw new Error(
          `Failed common version locate for manifest with ${suffix}.`,
          { cause: error },
        );
      }
    });

    this.commonVersion = commonVersion;
    this.suffixes = suffixes; // in desired order
    this.objects = objects;
  }
}

/**
 * Renders the canonical feature list to HTML, with SDK columns.
 *
 * @param {string} canonicalSource The YAML document containing the canonical feature list.
 * @param {ManifestObjects} sdkManifestObjects In memory, having passed initial structural validation and YAML parse.
 * @param {string} outputDirectoryPath The path to the directory to generate the HTML document to.
 * @param {string} subTitle The sub-title to be used in tab title and H1. Has a default value which makes sense when viewing multiple SDK manifest columns.
 */
const build = (
  canonicalSource,
  sdkManifestObjects,
  outputDirectoryPath,
  subTitle = 'SDK Features Matrix',
) => {
  // Load YAML source up-front for the canonical features list.
  validateStructure(YAML.parseDocument(canonicalSource).contents);

  // Second Parse: using YAML's simplest API, rendering pure JS entities representing our data model
  const features = YAML.parse(canonicalSource, yamlParserOptions);
  const sdkManifests = new Map();
  sdkManifestObjects.objects.forEach((object, suffix) => {
    try {
      const manifest = new Manifest(object, features);
      sdkManifests.set(suffix, manifest);
    } catch (error) {
      throw new Error(
        `Failed manifest validation for ${suffix}.`,
        { cause: error },
      );
    }
  });

  const sortedManifests = sdkManifestObjects.suffixes.map((suffix) => sdkManifests.get(suffix));
  const generator = new MatrixGenerator(features, sortedManifests);

  // First Pass: Measure depth.
  const arbitraryMaximumDepth = 10;
  const levelCount = generator.generate(arbitraryMaximumDepth);
  console.log(`levelCount = ${levelCount}`);

  // Create output directory in standard location within working directory.
  // The expectation is that this tool is run from the root of the repository.
  createDirectory(outputDirectoryPath);

  writeDocument(
    path.join(outputDirectoryPath, 'index.html'),
    generator,
    sdkManifestObjects.suffixes,
    levelCount,
    subTitle,
  );

  /**
   * Creates a directory at the given path if it doesn't exist, recursively if necessary.
   *
   * @param {string} directoryPath The directory path. Can be relative to current working directory.
   */
  function createDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }
};

module.exports = {
  build,
  loadSource,
  ManifestObjects,
};
