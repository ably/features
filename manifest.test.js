/* eslint-disable no-new */
const { Manifest } = require('./manifest');

// Wrap the provide map in a new map, under the compliance key, as required for a manifest.
const compliance = (map) => new Map([['compliance', map]]);

describe('Manifest', () => {
  describe('constructor', () => {
    it('fails when manifest indicates compliance with a header node but not any of its children', () => {
      const canonicalMap = new Map([
        ['Root Node with Heading', new Map([
          ['.class', 'Heading'],
          ['Child Node 1', null],
          ['Child Node 2', new Map([
            ['.class', 'Heading'],
          ])],
        ])],
      ]);

      [
        new Map([
          ['Root Node with Heading', null],
        ]),
        new Map([
          ['Root Node with Heading', new Map([['.caveats', 'Some commentary.']])],
        ]),
        new Map([
          ['Root Node with Heading', new Map([
            ['Child Node 2', null],
          ])],
        ]),
      ].forEach((manifestMap) => {
        expect(() => {
          new Manifest(compliance(manifestMap), canonicalMap);
        }).toThrow(/^Canonical node is a Header at path ".*", yet the manifest node has no children/);
      });
    });
  });

  describe('find', () => {
    const emptyMap = new Map();
    const populatedMap = new Map([
      ['Empty Map', emptyMap],
    ]);
    const complexMap = new Map([
      ['Empty Map', emptyMap],
      ['Populated Map', populatedMap],
    ]);
    const deeperMap = new Map([
      ['Complex Map', complexMap],
    ]);

    it('succeeds in finding a populated map', () => {
      expect((new Manifest(compliance(complexMap), complexMap)).find(['Populated Map'])).not.toBeUndefined();
      expect((new Manifest(compliance(deeperMap), deeperMap)).find(['Complex Map', 'Populated Map'])).not.toBeUndefined();
    });

    it('succeeds in finding an empty map', () => {
      expect((new Manifest(compliance(complexMap), complexMap)).find(['Empty Map'])).not.toBeUndefined();
      expect((new Manifest(compliance(deeperMap), deeperMap)).find(['Complex Map', 'Empty Map'])).not.toBeUndefined();
    });

    it('returns null for a key that is not present', () => {
      expect((new Manifest(compliance(emptyMap), populatedMap)).find(['Empty Map'])).toBeUndefined();
      expect((new Manifest(compliance(emptyMap), emptyMap)).find(['Dummy Key'])).toBeUndefined();
      expect((new Manifest(compliance(populatedMap), populatedMap)).find(['Dummy Key'])).toBeUndefined();
      expect((new Manifest(compliance(complexMap), complexMap)).find(['Dummy Key'])).toBeUndefined();
      expect((new Manifest(compliance(complexMap), complexMap)).find(['Empty Map', 'Dummy Key'])).toBeUndefined();
      expect((new Manifest(compliance(deeperMap), deeperMap)).find(['Complex Map', 'Dummy Key'])).toBeUndefined();
      expect((new Manifest(compliance(deeperMap), deeperMap)).find(['Complex Map', 'Empty Map', 'Dummy Key'])).toBeUndefined();
    });
  });
});
