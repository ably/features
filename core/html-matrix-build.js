const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const { Manifest } = require('./manifest');
const { MatrixGenerator } = require('./matrix');
const { writeDocument } = require('./html-matrix-renderer');
const { validateStructure } = require('./yaml-structure');

/**
 * Renders the canonical feature list to HTML, with SDK columns.
 *
 * @param {string} sdkFeaturesPath The path to the YAML document containing the canonical feature list.
 * @param {string[]} sdkManifestSuffixes In the order they're to be explored for each feature.
 * @param {Map} sdkManifestSourcePaths The paths to the YAML documents containing SDK manifests, keyed by suffix.
 * @param {string} outputDirectoryPath The path to the directory to generate the HTML document to.
 */
const build = (
  sdkFeaturesPath,
  sdkManifestSuffixes,
  sdkManifestSourcePaths,
  outputDirectoryPath,
) => {
  // Load YAML sources up-front, both for the canonical features list and the SDK manifests.
  const loadSource = (filePath) => fs.readFileSync(filePath).toString();
  const yamlSource = loadSource(sdkFeaturesPath);
  const sdkManifestSources = new Map();
  sdkManifestSuffixes.forEach((sdkManifestSuffix) => {
    sdkManifestSources.set(sdkManifestSuffix, loadSource(sdkManifestSourcePaths.get(sdkManifestSuffix)));
  });

  // First Parse: using YAML's mid-level API, rendering a graph of the YAML structure,
  // and then running some of our checks over that structure to check foundational requirements.
  validateStructure(YAML.parseDocument(yamlSource).contents);
  sdkManifestSources.forEach((sdkManifestSource) => {
    validateStructure(YAML.parseDocument(sdkManifestSource).contents);
  });

  // Second Parse: using YAML's simplest API, rendering pure JS entities representing our data model
  const parserOptions = {
    mapAsMap: true,
  };
  const object = YAML.parse(yamlSource, parserOptions);
  const sdkManifests = new Map();
  sdkManifestSources.forEach((sdkManifestSource, sdkManifestSuffix) => {
    try {
      const manifest = new Manifest(YAML.parse(sdkManifestSource, parserOptions), object);
      sdkManifests.set(sdkManifestSuffix, manifest);
    } catch (error) {
      throw new Error(
        `Failed manifest parse for ${sdkManifestSuffix}.`,
        { cause: error },
      );
    }
  });

  const sortedManifests = sdkManifestSuffixes.map((suffix) => sdkManifests.get(suffix));
  const generator = new MatrixGenerator(object, sortedManifests);

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
    sdkManifestSuffixes,
    levelCount,
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
};
