<script setup lang="ts">
import type { LandingZone, Planet, Moon, System } from '~~/types'

const profileEdit = useUserProfileEditStore()

interface gender {
  label: string
  value: string | null
}

const genderOptions = reactive<gender[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

const dayOptions = computed(() => {
  return Array.from({ length: 31 }, (_, index) => {
    const dayNum = index + 1
    return {
      label: dayNum.toString(),
      value: dayNum,
    }
  })
})

const monthOptions = [
  { label: 'Januar', value: 1 },
  { label: 'Februar', value: 2 },
  { label: 'März', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Dezember', value: 12 },
]

// --- Landing Zone Options for Birthplace and Current Residence ---
interface LandingZoneProcessed {
  id: string
  name: string | null
  planet?: {
    name: string | null
    astronomical_designation: string | null
    star_system?: {
      name: string | null
    } | null
  } | null
  moon?: {
    name: string | null
    astronomical_designation: string | null
    planet?: {
      name: string | null // Name of the planet the moon orbits
      astronomical_designation: string | null
      star_system?: {
        name: string | null
      } | null
    } | null
  } | null
}

const allLandingZones = ref<LandingZoneProcessed[]>([])

// const fetchLandingZoneData = async () => {
//   try {
//     // It's good practice to type the response if possible, though Directus SDK might return `any` by default for complex queries
//     const response = await $directus.items('landing_zones').readByQuery({
//       fields: [
//         'id',
//         'name',
//         'planet.name',
//         'planet.star_system.name',
//         'moon.name',
//         'moon.planet.name',
//         'moon.planet.star_system.name',
//       ],
//       limit: -1, // Fetch all landing zones
//     })
//     allLandingZones.value = (response.data as LandingZoneProcessed[]) || []
//   } catch (error) {
//     console.error('Failed to fetch landing zones:', error)
//     allLandingZones.value = [] // Ensure it's an array in case of error
//   }
// }

await useAsyncData(
  'ams:landing-zones-list',
  () =>
    useDirectus(
      readItems('landing_zones', {
        fields: [
          'id',
          'name',
          {
            planet: [
              'name',
              'astronomical_designation',
              { star_system: ['name'] },
            ],
          },
          {
            moon: [
              'name',
              'astronomical_designation',
              {
                planet: [
                  'name',
                  'astronomical_designation',
                  { star_system: ['name'] },
                ],
              },
            ],
          },
        ],
        limit: -1,
      })
    ),
  {
    transform: (response) => {
      allLandingZones.value = (response as LandingZoneProcessed[]) || []
    },
  }
)

const landingZoneOptions = computed(() => {
  return allLandingZones.value
    .map((lz) => {
      let systemName = 'N/A System'
      let parentName = 'N/A Parent'
      const landingZoneName = lz.name || 'N/A Landing Zone'

      if (lz.planet) {
        parentName =
          lz.planet.name || lz.planet.astronomical_designation || 'N/A Planet'
        if (lz.planet.star_system && lz.planet.star_system.name) {
          systemName = lz.planet.star_system.name
        }
      } else if (lz.moon && lz.moon.planet) {
        // Check lz.moon first, then lz.moon.planet for system info
        parentName =
          lz.moon.name || lz.moon.astronomical_designation || 'N/A Moon'
        if (lz.moon.planet.star_system && lz.moon.planet.star_system.name) {
          systemName = lz.moon.planet.star_system.name
        }
      }

      return {
        label: `${systemName} / ${parentName} / ${landingZoneName}`,
        value: lz.id,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField label="Geschlecht" name="sex" size="xs" class="w-full">
      <URadioGroup
        v-model="profileEdit.formData.sex"
        indicator="hidden"
        variant="table"
        orientation="horizontal"
        :items="genderOptions"
        class="prose-p:my-0"
      />
    </UFormField>
    <UFormField label="Geburtsdatum" name="birthdate" size="xs" class="w-full">
      <div class="grid grid-cols-3 gap-x-4">
        <UFormField label="Tag" name="birthdate_day" size="xs" class="w-full">
          <USelectMenu
            v-model="profileEdit.formData.birthdate_day"
            :items="dayOptions"
            value-key="value"
            variant="ams"
            size="md"
            placeholder="Tag"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Monat"
          name="birthdate_month"
          size="xs"
          class="w-full"
        >
          <USelectMenu
            v-model="profileEdit.formData.birthdate_month"
            :items="monthOptions"
            value-key="value"
            variant="ams"
            size="md"
            placeholder="Monat"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jahr" name="birthdate_year" size="xs" class="w-full">
          <UInput
            v-model="profileEdit.formData.birthdate_year"
            size="md"
            placeholder="Jahr"
            class="w-full"
            type="number"
            highlight
          />
        </UFormField>
      </div>
    </UFormField>
    <UFormField
      label="Aktueller Wohnort"
      name="current_residence"
      class="w-full"
      size="xs"
    >
      <USelectMenu
        v-model="profileEdit.formData.current_residence"
        value-key="value"
        label-key="label"
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="landingZoneOptions"
        placeholder="Wohnort auswählen"
        class="prose-p:my-0 w-full"
        searchable
        searchable-placeholder="Suchen..."
      />
    </UFormField>
    <UFormField label="Geburtsort" name="birthplace" class="w-full" size="xs">
      <USelectMenu
        v-model="profileEdit.formData.birthplace"
        value-key="value"
        label-key="label"
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="landingZoneOptions"
        placeholder="Geburtsort auswählen"
        class="prose-p:my-0 w-full"
        searchable
        searchable-placeholder="Suchen..."
      />
    </UFormField>
  </div>
</template>
