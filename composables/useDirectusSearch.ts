export const useDirectusSearch = (
	q: string,
	filter_properties: string[],
	custom_filter?: { [property: string]: string },
): { _or: { [property: string]: { _icontains: string } }[] } => {
	console.log('q', q)
	if (!q) return { _or: [] }
	function buildFilter(propertyPath: string, word: string, operator?: string) {
		// Split the property path into parts
		const parts = propertyPath.split('.')

		// Start with the innermost property
		let filter = operator ? { [operator]: word } : { _icontains: word }

		// Build the filter object from the inside out
		for (let i = parts.length - 1; i >= 0; i--) {
			filter = { [parts[i]]: filter }
		}

		return filter
	}

	const qwords = q.split(' ')

	let filter = qwords
		.map((word) => {
			const filters = filter_properties.map(property => buildFilter(property, word))

			return filters
		})
		.flat()

	if (custom_filter) {
		const customFilters = Object.entries(custom_filter).map(([property, value]) => {
			const filters = qwords.map(word => buildFilter(property, word, value))
			return filters
		})
		filter = filter.concat(customFilters.flat())
	}

	return { _or: filter }
}
