const path = require('path');
const { build, ManifestObjects } = require('@ably/features-core/html-matrix-build');

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

const resolveSource = (fileName) => path.resolve(__dirname, '..', fileName);

const sdkManifestSourcePaths = new Map(sdkManifestSuffixes.map((sdkManifestSuffix) => [
  sdkManifestSuffix,
  resolveSource(`sdk-manifests/ably-${sdkManifestSuffix}.yaml`),
]));

const sdkManifestObjects = new ManifestObjects(sdkManifestSuffixes, sdkManifestSourcePaths);

build(
  resolveSource('sdk.yaml'),
  sdkManifestObjects,
  'output',
);
