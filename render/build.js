const fs = require('fs');
const path = require('path');
const https = require('node:https');
const {
  build,
  loadSource,
  createDirectory,
  ManifestObjects,
} = require('@ably/features-core/html-matrix-build');

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

// Entry Point
(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exit(2);
  }
})();

/**
 * Called by entry point. The main build logic.
 */
async function main() {
  const resolveSource = (fileName) => path.resolve(__dirname, '..', fileName);
  const resolveManifestSource = (suffix) => resolveSource(`${manifestsPath}/ably-${suffix}.yaml`);

  const manifestsFolderName = 'sdk-manifests';
  const manifestsPath = resolveSource(manifestsFolderName);
  createDirectory(manifestsPath);

  const downloadPromises = [];
  sdkManifestSuffixes.forEach((sdkManifestSuffix) => {
    const url = `https://github.com/ably/ably-${sdkManifestSuffix}/raw/main/.ably/capabilities.yaml`;
    const promise = fetch(url);
    downloadPromises.push(promise);
    promise.then((body) => {
      fs.writeFileSync(resolveManifestSource(sdkManifestSuffix), body);
    });
  });
  await Promise.all(downloadPromises);

  const sdkManifestSourcePaths = new Map(sdkManifestSuffixes.map((sdkManifestSuffix) => [
    sdkManifestSuffix,
    resolveManifestSource(sdkManifestSuffix),
  ]));

  const sdkManifestObjects = new ManifestObjects(sdkManifestSuffixes, sdkManifestSourcePaths);

  console.log(`Feature List Version from ${sdkManifestObjects.objects.size} manifests: ${sdkManifestObjects.commonVersion}`);

  build(
    loadSource(resolveSource('sdk.yaml')),
    sdkManifestObjects,
    'output',
  );
}

/**
 * Simple Web-Fetch-alike function to HTTP GET a resource.
 * API based upon: https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * We need this because Node.js 16 (the maximum version supported by GitHub Actions) doesn't have Fetch.
 *
 * @param {string} url The location to GET from.
 * @returns {string} The body returned.
 */
async function fetch(url) {
  return new Promise((resolve, reject) => {
    const fetchOrFollowRedirect = (location, depth) => {
      if (depth > 3) {
        throw new Error('Exceeded arbitrary redirect follow limit.');
      }

      https.get(location, (response) => {
        const { statusCode } = response;
        const contentType = response.headers['content-type'];

        console.log(`Fetch: ${statusCode} status code from ${location}`);

        if (statusCode === 302) {
          fetchOrFollowRedirect(response.headers.location, depth + 1);
          return;
        }

        let error;
        if (statusCode !== 200) {
          error = new Error(`Request failed with status code ${statusCode}.`);
        } else if (!/^text\/plain/.test(contentType)) {
          error = new Error(`Unexpected content-type. Expected 'text/plain' but received '${contentType}'.`);
        }

        if (error) {
          response.resume(); // Consume response data to free up memory
          reject(error);
          return;
        }

        response.setEncoding('utf8');
        let bodyData = '';
        response.on('data', (chunk) => { bodyData += chunk; });
        response.on('end', () => {
          resolve(bodyData);
        });
      });
    };

    fetchOrFollowRedirect(url, 0);
  });
}
