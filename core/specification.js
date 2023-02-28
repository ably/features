const regularExpression = /^\*+\s@\((.+?)\)@\s.+$/;

const extractSpecPoints = (textile) => {
  const specPoints = [];
  textile.split('\n').forEach((line) => {
    const m = line.match(regularExpression);
    if (m && m.length > 1) {
      specPoints.push(m[1]);
    }
  });
  return specPoints;
};

module.exports = {
  extractSpecPoints,
};
