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

module.exports = {
  groupBy,
  identity
};
