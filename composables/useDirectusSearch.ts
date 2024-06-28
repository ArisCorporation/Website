export const useDirectusSearch = (
  q: string,
  filter_properties: string[],
): { _or: { [property: string]: { _icontains: string } }[] } => {
  function buildFilter(propertyPath, word) {
    // Split the property path into parts
    const parts = propertyPath.split('.');

    // Start with the innermost property
    let filter = { _icontains: word };

    // Build the filter object from the inside out
    for (let i = parts.length - 1; i >= 0; i--) {
      filter = { [parts[i]]: filter };
    }

    return filter;
  }

  const qwords = q.split(' ');

  const filter = qwords
    .map((word) => {
      const filters = filter_properties.map((property) => buildFilter(property, word));

      return filters;
    })
    .flat();

  return { _or: filter };
};
