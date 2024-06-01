import { watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { LocationQueryRaw } from 'vue-router';

export const useDebouncedSearchQuery = (
  search: Ref<string>,
  search_input: Ref<string>,
  options?: { useQuery?: boolean; typingAction?: Function; debounceAction?: Function },
): void => {
  const { replace } = useRouter();
  const { query } = useRoute();

  if (options?.useQuery !== false && query?.q) {
    search.value = query.q as string;
    search_input.value = query.q as string;
  }

  const debounceSearch = useDebounce(() => {
    search.value = search_input.value;

    if (options?.useQuery !== false) {
      replace({
        query: search_input.value ? ({ q: search_input.value } as LocationQueryRaw) : undefined,
      });
    }

    options?.debounceAction?.();
  }, 500);

  watch(search_input, () => {
    options?.typingAction?.();
    debounceSearch();
  });
};
