import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'

export const useSearch = (
	search: Ref<string>,
	search_input?: Ref<string>,
	options?: { debounce?: boolean, query?: boolean, typingAction?: Function, debounceAction?: Function },
): void => {
	const { replace } = useRouter()
	const route = useRoute()

	if (options?.debounce === true && search_input) {
		if (options?.query === true && route.query?.q) {
			search.value = route.query.q as string
			search_input.value = route.query.q as string
		}

		const debounceSearch = useDebounce(() => {
			search.value = search_input.value

			if (options?.query === true) {
				replace({
					query: search_input.value ? ({ ...route.query, q: search_input.value } as LocationQueryRaw) : { ...route.query, q: undefined },
				})
			}

			options?.debounceAction?.()
		}, 500)

		watch(search_input, () => {
			options?.typingAction?.()
			debounceSearch()
		})
	}
	else if (options?.debounce === false) {
		if (route.query?.q) {
			search.value = route.query.q as string
		}

		watch(search, () => {
			replace({
				query: search.value ? ({ ...route.query, q: search.value } as LocationQueryRaw) : { ...route.query, q: undefined },
			})
		})
	}
	else {
		throw new Error('useSearch: search_input is required when debounce is set to false')
	}
}
