function groupBy(items, key) {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item]
    }),
    {}
  );
}

function identity(value) {
  return value;
}

function valueOrDefault(value, defaultValue = 0) {
  return value ? value : defaultValue;
}

function sum(a, b) {
  return a + b;
}

module.exports = {
  groupBy,
  identity,
  valueOrDefault,
  sum
};
