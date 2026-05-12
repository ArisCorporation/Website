// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from "@directus/sdk";
import type { Ref, ComputedRef } from "vue";
import type { Schema, UserHangar } from "~~/types";

// Definiere die Felder-Struktur für bessere Lesbarkeit und Wartbarkeit
const USER_HANGAR_FIELDS: QueryFields<Schema, UserHangar> = [
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
      "mission_roles",
      {
        mission_roles: [
          "sort",
          { ams_mission_role_id: ["id", "name", "description"] },
        ],
      },
      {
        mission_roles_secondary: [
          "sort",
          { ams_mission_role_id: ["id", "name", "description"] },
        ],
      },
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

export default function useFetchAMSFleet(sort?: Ref<string[]> | ComputedRef<string[]>) {
  // Rufe useAsyncData mit dem reaktiven Key und der fetchData-Funktion auf.
  // Das zurückgegebene Objekt enthält data, pending, error, refresh usw.
  // und ist "awaitable", d.h. `await useUserHangarData(userId)` in der Komponente funktioniert.
  return useAsyncData<UserHangar[]>(
    "ams:internal-fleet",
    async () => {
      return (await useDirectus(
        readItems("user_hangars", {
          filter: {
            group: { _eq: "ariscorp" },
            visibility: { _neq: "hidden" },
            deleted: { _eq: false },
            ship: { _nnull: true },
          },
          fields: USER_HANGAR_FIELDS,
          limit: -1,
          sort: (sort?.value ?? ["ship.name"]) as any,
        }),
      )) as UserHangar[];
    },
    {
      default: () => [] as UserHangar[],
      server: false,
    },
  );
}
