const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const { compareKeys } = require('@ably/features-core/compare');
const { Manifest } = require('@ably/features-core/manifest');
const { MatrixGenerator } = require('@ably/features-core/matrix');
const { writeDocument } = require('@ably/features-core/html-matrix-renderer');

const sdkManifestSuffixes = [
  'java',
  'ruby',
  'php',
  'cocoa',
  'python',
  'rust',
  'go',
  'js',
  'dotnet',
  'flutter',
].sort();

// Load YAML sources up-front, both for the canonical features list and the SDK manifests.
const loadSource = (fileName) => fs.readFileSync(path.resolve(__dirname, '..', fileName)).toString();
const yamlSource = loadSource('sdk.yaml');
const sdkManifestSources = new Map();
sdkManifestSuffixes.forEach((sdkManifestSuffix) => {
  sdkManifestSources.set(sdkManifestSuffix, loadSource(`sdk-manifests/ably-${sdkManifestSuffix}.yaml`));
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
const outputDirectoryPath = 'output';
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

/**
 * Inspects YAML AST to ensure source constraints are met (e.g. ordered keys).
 *
 * @param {*} astNode The YAML AST node.
 * @param {string[]} parentKeys Parent keys, also indicating the depth of this node. Nodes at root have an empty array.
 */
function validateStructure(astNode, parentKeys = []) {
  if (astNode === undefined || astNode === null) {
    throw new Error(`Unexpected - astNode value cannot be undefined or null at "${parentKeys}".`);
  }
  if (parentKeys.length > 20) {
    throw new Error('Recursion depth exceeded arbitrary limit.');
  }

  const nodeType = astNode.type;
  let arrayIndex = 0;
  switch (nodeType) {
    case 'MAP':
      validateMapItems(astNode.items, parentKeys);
      break;

    case 'FLOW_SEQ':
    case 'SEQ':
      astNode.items.forEach((item) => {
        validateStructure(item, [...parentKeys, `${arrayIndex}`]);
        arrayIndex += 1;
      });
      break;

    case 'PLAIN':
    case 'BLOCK_LITERAL':
    case 'QUOTE_SINGLE':
      break;

    default:
      throw new Error(`Unhandled YAML AST node type "${nodeType}".`);
  }
}

/**
 * Inspects items of YAML AST map to ensure source constraints are met.
 *
 * @param {*[]} items The YAML AST 'MAP' node items.
 * @param {string[]} parentKeys Parent keys, also indicating the depth of this node. Nodes at root have an empty array.
 */
function validateMapItems(items, parentKeys) {
  let previousKeyValue;
  items.forEach((item) => {
    if (item.type !== 'PAIR') {
      throw new Error('Map items should be pairs.');
    }

    const { key, value } = item;
    if (key.type !== 'PLAIN') {
      throw new Error('Map keys must be plain scalars.');
    }
    const keyValue = key.value;

    if (previousKeyValue && compareKeys(keyValue, previousKeyValue) < 0) {
      throw new Error(`Keys not sorted ("${keyValue}" should not be after "${previousKeyValue}").`);
    }
    previousKeyValue = keyValue;

    // It is normal for `value` to be `null` here, where the map key is 'hanging' in the YAML - e.g. in the case of the
    // 'Hanging Parent Key' in this snippet:
    //
    // ```yaml
    // Some Parent Key:
    //   Hanging Parent Key:
    //   Some Other Key that Does have a Value: Hello World
    // ```
    //
    // The hanging key represents that there is intended to be a node at this location in the tree, but that there is
    // no additional information to convey about this node - above and beyond its name (the key).
    if (value !== null) {
      validateStructure(value, [...parentKeys, key]);
    }
  });
}
