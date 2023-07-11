const { getHigherVersion } = require('./get-higher-version');

describe('getHigherVersion', () => {
  test('should return the higher version number when version1 is greater', () => {
    expect(getHigherVersion('1.0', '1.0.1')).toBe('1.0.1');
    expect(getHigherVersion('2.0', '1.0')).toBe('2.0');
    expect(getHigherVersion('2.0.1', '2.0.0.1')).toBe('2.0.1');
    expect(getHigherVersion('2.0.1', '2.0.0')).toBe('2.0.1');
    expect(getHigherVersion('2.0.1', null)).toBe('2.0.1');
  });

  test('should return the higher version number when version2 is greater', () => {
    expect(getHigherVersion('1.0.1', '1.0')).toBe('1.0.1');
    expect(getHigherVersion('1.0', '2.0')).toBe('2.0');
    expect(getHigherVersion('2.0.0.1', '2.0.1')).toBe('2.0.1');
    expect(getHigherVersion('2.0.0', '2.0.1')).toBe('2.0.1');
    expect(getHigherVersion(null, '2.0.1')).toBe('2.0.1');
  });

  test('should return the same version number when version1 and version2 are equal', () => {
    expect(getHigherVersion('1.0', '1.0')).toBe('1.0');
    expect(getHigherVersion('2.0.0.1', '2.0.0.1')).toBe('2.0.0.1');
    expect(getHigherVersion('2.0.1', '2.0.1')).toBe('2.0.1');
  });
});
