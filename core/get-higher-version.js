const getHigherVersion = (version1, version2) => {
  const v1 = version1 || '';
  const v2 = version2 || '';

  const v1Components = v1.split('.');
  const v2Components = v2.split('.');

  for (let i = 0; i < Math.max(v1Components.length, v2Components.length); i += 1) {
    const v1Component = Number(v1Components[i]) || 0;
    const v2Component = Number(v2Components[i]) || 0;

    if (v1Component > v2Component) {
      return version1;
    }
    if (v1Component < v2Component) {
      return version2;
    }
  }

  return version1;
};

module.exports = {
  getHigherVersion,
};
