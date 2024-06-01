import { watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { LocationQueryRaw } from 'vue-router';

export const useDebouncedSearchQuery = (search: Ref<string>, search_input: Ref<string>): void => {
  const { replace } = useRouter();
  const { query } = useRoute();

  if (query?.q) {
    search.value = query.q as string;
    search_input.value = query.q as string;
  }

  const debounceSearch = useDebounce(() => {
    search.value = search_input.value;

    replace({
      query: search_input.value ? ({ q: search_input.value } as LocationQueryRaw) : undefined,
    });
  }, 500);

  watch(search_input, () => {
    debounceSearch();
  });
};
