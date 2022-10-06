const escape = require('escape-html');

const {
  IDENTITY_TRANSFORM,
  transformPath,
  transformString,
  transformStrings,
} = require('./transform');

const isPropertyKey = (key) => key.startsWith('.');
const propertyKeyName = (key) => key.substring(1);

const specificationPointRegExp = /^[A-Z]{1,3}[1-9]\d*([a-z]((([1-9]\d*)?[a-z])?([1-9]\d*)?)?)?$/;

class SpecificationPoint {
  constructor(value) {
    if (!specificationPointRegExp.test(value)) {
      throw new Error(`Value '${value}' is not formatted like a specification point.`);
    }
    this.value = value;
  }

  toString() {
    return this.value;
  }

  toHtmlLink() {
    const url = `https://docs.ably.com/client-lib-development-guide/features/#${this.value}`;
    return `<a href="${url}" target="_blank" rel="noopener"><code>${escape(this.value)}</code></a>`;
  }
}

class Properties {
  constructor(node) {
    if (!(node instanceof Map)) {
      return; // nothing to be extracted
    }
    node.forEach((value, key) => {
      if (isPropertyKey(key)) {
        const name = propertyKeyName(key);
        switch (name) {
          case 'caveats':
            // used in the canonical features list
            this.caveats = transformString(value, IDENTITY_TRANSFORM);
            break;

          case 'documentation':
            // used in the canonical features list
            this.documentationUrls = transformStrings(value, (stringValue) => new URL(stringValue));
            break;

          case 'requires':
            // used in the canonical features list
            this.requires = transformStrings(value, transformPath);
            break;

          case 'specification':
            // used in the canonical features list
            this.specificationPoints = transformStrings(value, (stringValue) => new SpecificationPoint(stringValue));
            break;

          case 'synopsis':
            // used in the canonical features list
            this.synopsis = transformString(value, IDENTITY_TRANSFORM);
            break;

          case 'variants':
            // used in the SDK manifests
            this.variants = transformStrings(value, IDENTITY_TRANSFORM);
            break;

          default:
            throw new Error(`Property key '${name}' is not recognised.`);
        }
      }
    });
  }
}

module.exports = {
  isPropertyKey,
  Properties,
  SpecificationPoint,
};
