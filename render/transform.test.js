const {
  IDENTITY_TRANSFORM,
  transformPath,
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

describe('transformPath', () => {
  it('successfully transforms', () => {
    expect(transformPath('A')).toStrictEqual(['A']);
    expect(transformPath('A: B')).toStrictEqual(['A', 'B']);
    expect(transformPath('A: B: C')).toStrictEqual(['A', 'B', 'C']);
  });

  it('fails for values that are not a string', () => {
    const errorMessageMatcher = /^Encountered value of type/;
    expect(() => { transformPath(0); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath(-1); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath(null); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath(undefined); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath(NaN); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath([]); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath(['A']); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath({}); }).toThrow(errorMessageMatcher);
    expect(() => { transformPath({ A: 'B' }); }).toThrow(errorMessageMatcher);
  });

  describe('for invalid string values', () => {
    it('fails for empty', () => {
      const errorMessageMatcher = /^Empty or whitespace-only/;
      expect(() => { transformPath(''); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(' '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('  '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\t'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\n'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(' \n'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\n '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(': '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(':  '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('  :  '); }).toThrow(errorMessageMatcher);
    });

    it('fails for spurious whitespace', () => {
      const errorMessageMatcher = /^Spurious leading or trailing whitespace/;
      expect(() => { transformPath(' :'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('  :'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\t:'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\n:'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\t :'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('\n :'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B: C '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B:  C'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B : C'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A:  B: C'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A : B: C'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(' A: B: C'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(' A: B: C '); }).toThrow(errorMessageMatcher);
    });

    it('fails for use of partial delimiter within segment', () => {
      const errorMessageMatcher = /^Illegal character ':'/;
      expect(() => { transformPath(':'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('::'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(':: '); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath(':: :'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A:: B:'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B: C:'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B: C::'); }).toThrow(errorMessageMatcher);
      expect(() => { transformPath('A: B:: C:'); }).toThrow(errorMessageMatcher);
    });
  });
});
