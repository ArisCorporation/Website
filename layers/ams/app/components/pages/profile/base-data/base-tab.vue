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
      value: dayNum.toString().padStart(2, '0'),
    }
  })
})

const monthOptions = [
  { label: 'Januar', value: '01' },
  { label: 'Februar', value: '02' },
  { label: 'März', value: '03' },
  { label: 'April', value: '04' },
  { label: 'Mai', value: '05' },
  { label: 'Juni', value: '06' },
  { label: 'Juli', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'Oktober', value: '10' },
  { label: 'November', value: '11' },
  { label: 'Dezember', value: '12' },
]

const birthDay = ref<{ label: string; value: string } | null | undefined>(null)
const birthMonth = ref<{ label: string; value: string } | null | undefined>(
  null
)
const birthYear = ref<string | null | undefined>(null)

// --- Synchronisation: Store.birthdate -> Lokale Datums-Refs ---
watch(
  () => profileEdit.formData.birthdate,
  (newDateString) => {
    // Verhindern, dass der Watcher auslöst, bevor formData initialisiert wurde
    if (
      !profileEdit.formData ||
      (Object.keys(profileEdit.formData).length === 0 &&
        newDateString !== undefined)
    ) {
      return
    }

    if (newDateString && /^\d{4}-\d{2}-\d{2}$/.test(newDateString)) {
      const [yearValue, monthValue, dayValue] = newDateString.split('-')

      // Finde das passende Objekt für Tag und Monat
      const targetDayOption = dayOptions.value.find(
        (opt) => opt.value === dayValue
      )
      // Vergleiche die 'value' Eigenschaften oder die Objekte selbst, um unnötige Updates zu vermeiden
      if (birthDay.value?.value !== targetDayOption?.value) {
        birthDay.value = targetDayOption || null
      }

      const targetMonthOption = monthOptions.find(
        (opt) => opt.value === monthValue
      )
      if (birthMonth.value?.value !== targetMonthOption?.value) {
        birthMonth.value = targetMonthOption || null
      }
      if (birthYear.value !== yearValue) birthYear.value = yearValue
    } else {
      // Wenn das Datum im Store null/undefined/ungültig ist, lokale Refs zurücksetzen
      if (birthDay.value !== null) birthDay.value = null
      if (birthMonth.value !== null) birthMonth.value = null
      if (birthYear.value !== null) birthYear.value = null
    }
  },
  { immediate: true }
)

// --- Synchronisation: Lokale Datums-Refs -> Store.birthdate ---
watch([birthDay, birthMonth, birthYear], ([dayObj, monthObj, yearVal]) => {
  // Verhindern, dass der Watcher auslöst, bevor formData initialisiert wurde
  if (!profileEdit.formData || Object.keys(profileEdit.formData).length === 0) {
    return
  }

  const day = dayObj?.value
  const month = monthObj?.value
  const year = yearVal // year ist immer noch string | null | undefined

  if (day && month && year && year.length === 4) {
    const dayInt = parseInt(day, 10)
    const monthInt = parseInt(month, 10)
    const yearInt = parseInt(year, 10)

    // Validierung der Tage im Monat (inkl. einfacher Schaltjahrprüfung)
    const daysInMonthMap = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (
      monthInt === 2 &&
      (yearInt % 400 === 0 || (yearInt % 4 === 0 && yearInt % 100 !== 0))
    ) {
      daysInMonthMap[2] = 29
    }

    if (
      dayInt > 0 &&
      monthInt > 0 &&
      monthInt <= 12 && // Ensure monthInt is valid before indexing daysInMonthMap
      dayInt <= daysInMonthMap[monthInt]
    ) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(
        2,
        '0'
      )}`
      if (profileEdit.formData.birthdate !== formattedDate) {
        profileEdit.formData.birthdate = formattedDate
      }
    } else {
      // Ungültige Datumskombination (z.B. 30. Februar)
      // Alle drei Felder wurden ausgefüllt, aber sie ergeben kein gültiges Datum.
      if (profileEdit.formData.birthdate !== null) {
        profileEdit.formData.birthdate = null
      }
    }
  } else if (
    !dayObj && // Prüfe auf das Objekt für Tag
    !monthObj && // Prüfe auf das Objekt für Monat
    !yearVal && // yearVal ist der String-Wert
    profileEdit.formData.birthdate !== null
  ) {
    // Alle Felder wurden explizit geleert.
    profileEdit.formData.birthdate = null
  }
  // Wenn nur einige Felder ausgefüllt sind (z.B. Tag ist gesetzt, Monat und Jahr sind null),
  // oder wenn das Jahr keine 4 Ziffern hat, wird nichts unternommen.
  // Dies ermöglicht es dem Benutzer, die Felder nacheinander auszufüllen, ohne dass sie zurückgesetzt werden.
})

// --- Landing Zone Options for Birthplace and Current Residence ---
const { $directus } = useNuxtApp()

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
console.log('test', allLandingZones.value)
const landingZoneOptions = computed(() => {
  return allLandingZones.value
    .map((lz) => {
      console.log('lz:', lz)
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

console.log(allLandingZones.value)
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
      <!--
        Hinweis: Die Aufteilung von birthdate in Tag, Monat, Jahr erfordert zusätzliche Logik (z.B. computed properties oder watcher),
        um diese Teile mit profileEdit.formData.birthdate (erwartet einen einzelnen String wie "YYYY-MM-DD") zu synchronisieren.
        Fürs Erste wird hier ein Platzhalter-Input für den gesamten String gezeigt oder die bestehenden Inputs müssen entsprechend angepasst werden.
        Für eine einfache Integration könnte man hier ein UInput v-model="profileEdit.formData.birthdate" verwenden und den Nutzer bitten, das Datum im korrekten Format einzugeben.
      -->
      <div class="grid grid-cols-3 gap-x-4">
        <UFormField label="Tag" name="birthdate_day" size="xs" class="w-full">
          <USelectMenu
            v-model="birthDay"
            :items="dayOptions"
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
            v-model="birthMonth"
            :items="monthOptions"
            variant="ams"
            size="md"
            placeholder="Monat"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jahr" name="birthdate_year" size="xs" class="w-full">
          <UInput
            v-model="birthYear"
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
        class="prose-p:my-0 w-full max-w-sm"
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
        class="prose-p:my-0 w-full max-w-sm"
        searchable
        searchable-placeholder="Suchen..."
      />
    </UFormField>
  </div>
</template>
