import { watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { LocationQueryRaw } from 'vue-router';

export const useSearchQuery = (search: Ref<string>): void => {
  const { replace } = useRouter();
  const { query } = useRoute();

  if (query?.q) {
    search.value = query.q as string;
  }

  watch(search, () => {
    replace({
      query: search.value ? ({ q: search.value } as LocationQueryRaw) : undefined,
    });
  });
};
