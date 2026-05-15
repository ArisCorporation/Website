export type TableFilterOption = {
  label: string
  value: string
}

export type TableActiveFilter<TKey extends string = string> = {
  key: TKey
  label: string
  value: string
  displayValue: string
}

export function buildTableFilterOptions<T>(
  items: T[],
  getOption: (item: T) => TableFilterOption | null | undefined
) {
  const options = new Map<string, TableFilterOption>()

  for (const item of items) {
    const option = getOption(item)
    const value = option?.value?.trim()
    const label = option?.label?.trim()

    if (!value || !label || options.has(value)) continue

    options.set(value, {
      label,
      value,
    })
  }

  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, 'de'))
}

export function buildActiveTableFilters<TKey extends string>(params: {
  filters: Record<TKey, string>
  labels: Record<TKey, string>
  options: Record<TKey, TableFilterOption[]>
}) {
  const { filters, labels, options } = params

  return (Object.keys(filters) as TKey[]).flatMap((key) => {
    const value = filters[key]?.trim()

    if (!value) return []

    return [
      {
        key,
        label: labels[key],
        value,
        displayValue:
          options[key].find((option) => option.value === value)?.label ?? value,
      },
    ] satisfies TableActiveFilter<TKey>[]
  })
}
