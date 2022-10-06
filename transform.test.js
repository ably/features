const {
  IDENTITY_TRANSFORM,
  transformPaths,
  transformString,
  transformStrings,
} = require('./transform');

test('IDENTITY_TRANSFORM', () => {
  expect(IDENTITY_TRANSFORM(0)).toBe(0);
  expect(IDENTITY_TRANSFORM(666)).toBe(666);
  expect(IDENTITY_TRANSFORM(null)).toBe(null);
  expect(IDENTITY_TRANSFORM(undefined)).toBe(undefined);
  expect(IDENTITY_TRANSFORM('hello')).toBe('hello');
  expect(IDENTITY_TRANSFORM('')).toBe('');
  expect(IDENTITY_TRANSFORM(' ')).toBe(' ');
});

const intTransformer = (value) => parseInt(value, 10);

describe('transformString', () => {
  it('successfully identity transforms', () => {
    expect(transformString('', IDENTITY_TRANSFORM)).toBe('');
    expect(transformString('hello', IDENTITY_TRANSFORM)).toBe('hello');
  });

  it('successfully custom transforms', () => {
    expect(transformString('123', intTransformer)).toBe(123);
    expect(transformString('0', intTransformer)).toBe(0);
    expect(transformString('-1', intTransformer)).toBe(-1);
    expect(transformString('hello', intTransformer)).toBeNaN();
  });

  it('fails for non-string values', () => {
    expect(() => { transformString(0, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString(null, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString(undefined, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString([], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString(['hello'], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString({}, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformString({ hello: 'world' }, IDENTITY_TRANSFORM); }).toThrow();
  });
});

describe('transformStrings', () => {
  describe('for string arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformStrings('', IDENTITY_TRANSFORM)).toStrictEqual(['']);
      expect(transformStrings('hello', IDENTITY_TRANSFORM)).toStrictEqual(['hello']);
    });

    it('successfully custom transforms', () => {
      expect(transformStrings('123', intTransformer)).toStrictEqual([123]);
      expect(transformStrings('0', intTransformer)).toStrictEqual([0]);
      expect(transformStrings('-1', intTransformer)).toStrictEqual([-1]);
      expect(transformStrings('hello', intTransformer)).toStrictEqual([NaN]);
    });
  });

  describe('for string array arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformStrings([''], IDENTITY_TRANSFORM)).toStrictEqual(['']);
      expect(transformStrings(['hello'], IDENTITY_TRANSFORM)).toStrictEqual(['hello']);
      expect(transformStrings(['a', 'b', 'c'], IDENTITY_TRANSFORM)).toStrictEqual(['a', 'b', 'c']);
    });

    it('successfully custom transforms', () => {
      expect(transformStrings(['123'], intTransformer)).toStrictEqual([123]);
      expect(transformStrings(['0'], intTransformer)).toStrictEqual([0]);
      expect(transformStrings(['-1'], intTransformer)).toStrictEqual([-1]);
      expect(transformStrings(['1', '2', '3'], intTransformer)).toStrictEqual([1, 2, 3]);
      expect(transformStrings(['hello'], intTransformer)).toStrictEqual([NaN]);
    });
  });

  it('fails for non-string or non-string-array values', () => {
    expect(() => { transformStrings(0, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings(null, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings(undefined, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings([123], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings(['hello', 456], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings({}, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformStrings({ hello: 'world' }, IDENTITY_TRANSFORM); }).toThrow();
  });
});

describe('transformPaths', () => {
  describe('for string arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformPaths('', IDENTITY_TRANSFORM)).toStrictEqual([['']]);
      expect(transformPaths('hello', IDENTITY_TRANSFORM)).toStrictEqual([['hello']]);
    });

    it('successfully custom transforms', () => {
      expect(transformPaths('123', intTransformer)).toStrictEqual([[123]]);
      expect(transformPaths('0', intTransformer)).toStrictEqual([[0]]);
      expect(transformPaths('-1', intTransformer)).toStrictEqual([[-1]]);
      expect(transformPaths('hello', intTransformer)).toStrictEqual([[NaN]]);
    });
  });

  describe('for string array arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformPaths([''], IDENTITY_TRANSFORM)).toStrictEqual([['']]);
      expect(transformPaths(['hello'], IDENTITY_TRANSFORM)).toStrictEqual([['hello']]);
      expect(transformPaths(['a', 'b', 'c'], IDENTITY_TRANSFORM)).toStrictEqual([['a', 'b', 'c']]);
    });

    it('successfully custom transforms', () => {
      expect(transformPaths(['123'], intTransformer)).toStrictEqual([[123]]);
      expect(transformPaths(['0'], intTransformer)).toStrictEqual([[0]]);
      expect(transformPaths(['-1'], intTransformer)).toStrictEqual([[-1]]);
      expect(transformPaths(['1', '2', '3'], intTransformer)).toStrictEqual([[1, 2, 3]]);
      expect(transformPaths(['hello'], intTransformer)).toStrictEqual([[NaN]]);
    });
  });

  describe('for arrays of string arrays arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformPaths([['']], IDENTITY_TRANSFORM)).toStrictEqual([['']]);
      expect(transformPaths([['hello']], IDENTITY_TRANSFORM)).toStrictEqual([['hello']]);
      expect(transformPaths([['a'], ['b'], ['c']], IDENTITY_TRANSFORM)).toStrictEqual([['a'], ['b'], ['c']]);
      expect(transformPaths([['a', 'b', 'c']], IDENTITY_TRANSFORM)).toStrictEqual([['a', 'b', 'c']]);
    });

    it('successfully custom transforms', () => {
      expect(transformPaths([['123']], intTransformer)).toStrictEqual([[123]]);
      expect(transformPaths([['0']], intTransformer)).toStrictEqual([[0]]);
      expect(transformPaths([['-1']], intTransformer)).toStrictEqual([[-1]]);
      expect(transformPaths([['1'], ['2'], ['3']], intTransformer)).toStrictEqual([[1], [2], [3]]);
      expect(transformPaths([['1', '2', '3']], intTransformer)).toStrictEqual([[1, 2, 3]]);
      expect(transformPaths([['hello']], intTransformer)).toStrictEqual([[NaN]]);
      expect(transformPaths([['', '3'], '4'], intTransformer)).toStrictEqual([[NaN, 3], [4]]);
    });
  });

  describe('for arrays of mixed string arrays and strings arguments', () => {
    it('successfully identity transforms', () => {
      expect(transformPaths([' ', ['']], IDENTITY_TRANSFORM)).toStrictEqual([[' '], ['']]);

      expect(transformPaths([['hello'], 'world', ['alphA', 'Beta']], IDENTITY_TRANSFORM))
        .toStrictEqual([['hello'], ['world'], ['alphA', 'Beta']]);

      expect(transformPaths([['a'], 'b', ['c']], IDENTITY_TRANSFORM)).toStrictEqual([['a'], ['b'], ['c']]);
      expect(transformPaths(['a', ['b', 'c', 'd'], 'e'], IDENTITY_TRANSFORM))
        .toStrictEqual([['a'], ['b', 'c', 'd'], ['e']]);
    });

    it('successfully custom transforms', () => {
      expect(transformPaths([['123'], '456'], intTransformer)).toStrictEqual([[123], [456]]);
      expect(transformPaths([['0'], '0'], intTransformer)).toStrictEqual([[0], [0]]);
      expect(transformPaths(['-1', ['-1']], intTransformer)).toStrictEqual([[-1], [-1]]);
      expect(transformPaths([['1'], '2', ['3']], intTransformer)).toStrictEqual([[1], [2], [3]]);
      expect(transformPaths([['1', '2', '3'], '4', '5'], intTransformer)).toStrictEqual([[1, 2, 3], [4], [5]]);
      expect(transformPaths([['hello'], 'world'], intTransformer)).toStrictEqual([[NaN], [NaN]]);
      expect(transformPaths([['', '3'], '4', 'boo', ['pah']], intTransformer))
        .toStrictEqual([[NaN, 3], [4], [NaN], [NaN]]);
    });
  });

  it('fails for non-string or non-string-array or non-string-array-array values', () => {
    expect(() => { transformPaths(0, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths(null, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths(undefined, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths([123], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths([[123]], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths(['hello', 456], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths([['hello'], [456]], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths([['hello', 456]], IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths({}, IDENTITY_TRANSFORM); }).toThrow();
    expect(() => { transformPaths({ hello: 'world' }, IDENTITY_TRANSFORM); }).toThrow();
  });
});
