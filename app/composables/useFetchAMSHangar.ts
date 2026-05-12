// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from "@directus/sdk";
import { type Ref, type ComputedRef, computed } from "vue";
import type { Schema, UserHangar } from "~~/types";

// Definiere die Felder-Struktur für bessere Lesbarkeit und Wartbarkeit
export const USER_HANGAR_FIELDS: QueryFields<Schema, UserHangar> = [
  "*",
  { department: ["id", "name", "logo"] },
  { active_module: ["id", "name"] },
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
    ],
  },
];

export default function useFetchAMSHangar(
  userId: Ref<string | number | undefined>,
  routeId?: string,
  sort?: Ref<string[]> | ComputedRef<string[]>,
) {
  // Rufe useAsyncData mit dem reaktiven Key und der fetchData-Funktion auf.
  // Das zurückgegebene Objekt enthält data, pending, error, refresh usw.
  // und ist "awaitable", d.h. `await useUserHangarData(userId)` in der Komponente funktioniert.
  return useAsyncData<UserHangar[]>(
    computed(() => `ams:user-hangar-${userId.value}`), // Der ComputedRef für den Key
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
    },
  );
}
