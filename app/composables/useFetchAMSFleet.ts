// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from "@directus/sdk";
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

export default function useFetchAMSFleet() {
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
          sort: ["ship.name"],
        }),
      )) as UserHangar[];
    },
    {
      default: () => [] as UserHangar[],
      server: false,
    },
  );
}
