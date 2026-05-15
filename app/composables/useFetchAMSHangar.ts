// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from "@directus/sdk";
import { type Ref, type ComputedRef, computed } from "vue";
import type { Schema, UserHangar } from "~~/types";

export const USER_HANGAR_FIELDS: QueryFields<Schema, UserHangar> = [
  "id",
  "name",
  "buy_status",
  "visibility",
  "group",
  "deleted",
  { department: ["id", "name", "logo"] },
  {
    modules: [
      "id",
      { slot: ["id", "name", "sort"] },
      {
        module: [
          "id",
          "name",
          { gallery: ["directus_file_id", "sort"] },
          { manufacturer: ["name", "code"] },
        ],
      },
    ],
  },
  {
    user: ["id", "title", "first_name", "middle_name", "last_name", "avatar"],
  },
  {
    ship: [
      "id",
      "name",
      "variant_code",
      "stats",
      "production_state",
      { thumbnail: ["id"] },
      {
        hull: [
          "id",
          "name",
          "slug",
          "description",
          { manufacturer: ["name", "code", "slug"] },
        ],
      },
      { module_slots: ["id", "name", "sort"] },
    ],
  },
];

export default function useFetchAMSHangar(
  userId: Ref<string | number | undefined>,
  routeId?: string,
  sort?: Ref<string[]> | ComputedRef<string[]>,
) {
  return useAsyncData<UserHangar[]>(
    computed(() => `ams:user-hangar-${userId.value}`),
    async () => {
      return (await useDirectus(
        readItems("user_hangars", {
          filter: {
            user: { _eq: userId.value },
            deleted: { _eq: false },
            ship: { _null: false },
            ...(routeId ? { visibility: { _neq: "hidden" } } : {}),
          },
          fields: USER_HANGAR_FIELDS,
          sort: (sort?.value ?? ["ship.name"]) as any,
        }),
      )) as UserHangar[];
    },
    {
      default: () => [] as UserHangar[],
      watch: [userId],
    },
  );
}
