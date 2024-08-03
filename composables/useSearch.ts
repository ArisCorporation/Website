import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'

export const useSearch = (
	search: Ref,
	search_input?: Ref,
	options?: { debounce?: boolean, query?: boolean, typingAction?: Function, debounceAction?: Function, query_name?: string, options?: typeof search.value[] },
): void => {
	const { replace } = useRouter()
	const route = useRoute()

	if(typeof search.value !== "string") {
		if (route.query[options?.query_name || 'q']) {
			search.value = options?.options?.find((option: typeof search.value) => option?.id === route.query[options?.query_name || 'q'])
		}

		watch(search, () => {
			replace({
				query: search.value?.id ? ({ ...route.query, [options?.query_name || 'q']: search.value?.id } as LocationQueryRaw) : { ...route.query, [options?.query_name || 'q']: undefined },
			})
		})
		return
	}
	 if (options?.debounce === true && search_input) {
		if (options?.query === true && route.query[options?.query_name || 'q']) {
			search.value = route.query[options?.query_name || 'q'] as string
			search_input.value = route.query[options?.query_name || 'q'] as string
		}

		const debounceSearch = useDebounce(() => {
			search.value = search_input.value

			if (options?.query === true) {
				replace({
					query: search_input.value ? ({ ...route.query, [options?.query_name || 'q']: search_input.value } as LocationQueryRaw) : { ...route.query, [options?.query_name || 'q']: undefined },
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
		if (route.query[options?.query_name || 'q']) {
			search.value = route.query[options?.query_name || 'q'] as string
		}

		watch(search, () => {
			replace({
				query: search.value ? ({ ...route.query, [options?.query_name || 'q']: search.value } as LocationQueryRaw) : { ...route.query, [options?.query_name || 'q']: undefined },
			})
		})
	}
	else {
		throw new Error('useSearch: search_input is required when debounce is set to false')
	}
}
