<script setup lang="ts">
import type {
  Department,
  DirectusRole,
  DirectusUser,
  LandingZone,
  UserHangar,
} from '~~/types'

const route = useRoute()

const employeeId = route.params.id as string
const dataId = computed(() => `ams:employee-${employeeId}`)

const { data: employee } = await useAsyncData<DirectusUser>(
  dataId,
  async () => {
    return (await useDirectus(
      readUser(employeeId, {
        fields: [
          '*',
          { hangar_items: USER_HANGAR_FIELDS },
          { primary_department: ['name', 'logo'] },
          { secondary_department: ['name', 'logo'] },
          { role: ['name', 'label'] },
          {
            birthplace: [
              'name',
              { planet: ['name', { star_system: ['name'] }] },
              {
                moon: ['name', { planet: ['name', { star_system: ['name'] }] }],
              },
            ],
          },
          {
            current_residence: [
              'name',
              { planet: ['name', { star_system: ['name'] }] },
              {
                moon: ['name', { planet: ['name', { star_system: ['name'] }] }],
              },
            ],
          },
        ],
        deep: {
          hangar_items: {
            _filter: {
              deleted: { _eq: false },
              visibility: { _neq: 'hidden' },
            },
          },
        },
      })
    )) as DirectusUser
  }
)

const memberSinceDate = computed(() => {
  if (!employee.value?.date_created) return 'N/A'
  const date = new Date(employee.value.date_created)
  date.setFullYear(date.getFullYear() + 930)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
})

const memberSinceFormatted = computed(() => {
  if (!employee.value?.date_created) return 'N/A'
  const date = new Date(employee.value.date_created)
  date.setFullYear(date.getFullYear() + 930)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
})

const getAge = computed(() => {
  if (!employee.value?.birthdate) return 'N/A'

  const birthDate = new Date(employee.value.birthdate)
  const realBirthDate = new Date(birthDate)
  realBirthDate.setFullYear(birthDate.getFullYear() - 930)

  const today = new Date()
  let calculatedAge = today.getFullYear() - realBirthDate.getFullYear()
  const m = today.getMonth() - realBirthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < realBirthDate.getDate())) {
    calculatedAge--
  }

  return calculatedAge
})

const formatLocation = (location: LandingZone | null | undefined) => {
  if (!location || !location.name) return 'N/A'

  const landingZoneName = location.name
  let parentName = ''
  let systemName = ''

  if (location.planet && typeof location.planet !== 'string') {
    parentName = location.planet.name ?? ''
    if (
      location.planet.star_system &&
      typeof location.planet.star_system !== 'string'
    ) {
      systemName = location.planet.star_system.name ?? ''
    }
  } else if (location.moon && typeof location.moon !== 'string') {
    parentName = location.moon.name ?? ''
    if (
      location.moon.planet &&
      typeof location.moon.planet !== 'string' &&
      location.moon.planet.star_system &&
      typeof location.moon.planet.star_system !== 'string'
    ) {
      systemName = location.moon.planet.star_system.name ?? ''
    }
  }

  if (systemName && parentName && landingZoneName) {
    return `${systemName} / ${parentName} / ${landingZoneName}`
  }

  return landingZoneName
}

const formattedBirthplace = computed(() =>
  formatLocation(employee.value?.birthplace as LandingZone)
)
const formattedCurrentResidence = computed(() =>
  formatLocation(employee.value?.current_residence as LandingZone)
)

interface ITables {
  title: string
  icon: string
  data: ITableData[][]
}

interface ITableData {
  label: string
  value: string | string[]
  link?: string | null
}

const mainTables = computed<ITables[]>(() => {
  if (!employee.value) return []
  return [
    {
      title: 'Persönliche Informationen',
      icon: 'i-lucide-user',
      data: [
        [
          {
            label: 'Bürgerlicher Name',
            value: getUserLabel(employee.value as DirectusUser) ?? 'N/A',
          },
          {
            label: 'Geschlecht',
            value: getSexLabel(employee.value?.sex)?.label ?? 'N/A',
          },
        ],
        [
          {
            label: 'Geburtsdatum',
            value: employee.value?.birthdate
              ? new Intl.DateTimeFormat('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(new Date(employee.value?.birthdate))
              : 'N/A',
          },
          {
            label: 'Alter',
            value: getAge.value ? `${getAge.value} Jahre alt` : 'N/A',
          },
        ],
        [
          {
            label: 'Geburtsort',
            value: formattedBirthplace.value,
          },
          {
            label: 'Aktueller Wohnort',
            value: formattedCurrentResidence.value,
          },
        ],
        [
          {
            label: 'Körpergröße',
            value: employee.value?.height
              ? `${employee.value?.height} cm`
              : 'N/A',
          },
          {
            label: 'Körpergewicht',
            value: employee.value?.weight
              ? `${employee.value?.weight} kg`
              : 'N/A',
          },
          {
            label: 'Haarfarbe',
            value: employee.value?.hair_color ?? 'N/A',
          },
          {
            label: 'Augenfarbe',
            value: employee.value?.eye_color ?? 'N/A',
          },
        ],
      ],
    },
    {
      title: 'Militärischer Dienst',
      icon: 'i-ph-medal-military',
      data: [
        [
          {
            label: 'Dienstzeit',
            value: employee.value?.duty_from_month
              ? `${employee.value?.duty_from_month}/${employee.value?.duty_from_year} - ${employee.value?.duty_to_month}/${employee.value?.duty_to_year}`
              : 'N/A',
          },
          {
            label: 'Division',
            value: getDivisionLabel(employee.value?.duty_division) ?? 'N/A',
          },
          {
            label: 'Entlassen',
            value:
              employee.value?.duty_end === 'dishonorable'
                ? 'Unehrenhaft'
                : employee.value?.duty_end === 'honorable'
                ? 'Ehrenhaft'
                : 'N/A',
          },
        ],
      ],
    },
    {
      title: 'Spezifische Information',
      icon: 'i-lucide-list',
      data: [
        [
          {
            label: 'Hobbies',
            value: employee.value?.hobbies_list?.[0]
              ? employee.value?.hobbies_list
              : 'N/A',
          },
          {
            label: 'Angewohnheiten',
            value: employee.value?.habits_list?.[0]
              ? employee.value?.habits_list
              : 'N/A',
          },
          {
            label: 'Talente',
            value: employee.value?.talents_list?.[0]
              ? employee.value?.talents_list
              : 'N/A',
          },
          {
            label: 'Tics & Marotten',
            value: employee.value?.tics_list?.[0]
              ? employee.value?.tics_list
              : 'N/A',
          },
          {
            label: 'Freizeitgestaltung',
            value: employee.value?.activities_list?.[0]
              ? employee.value?.activities_list
              : 'N/A',
          },
          {
            label: 'Rätselhafte Züge',
            value: employee.value?.mysterious_list?.[0]
              ? employee.value?.mysterious_list
              : 'N/A',
          },
          {
            label: 'Hervorstechender Charakterzug',
            value: employee.value?.character_trait_list?.[0]
              ? employee.value?.character_trait_list
              : 'N/A',
          },
          {
            label: 'Ängste',
            value: employee.value?.fears_list?.[0]
              ? employee.value?.fears_list
              : 'N/A',
          },
        ],
      ],
    },
    {
      title: 'Geschmäcker',
      icon: 'i-lucide-list',
      data: [
        [
          {
            label: 'Musik',
            value: employee.value?.music_list?.[0]
              ? employee.value?.music_list
              : 'N/A',
          },
          {
            label: 'Filme',
            value: employee.value?.movies_list?.[0]
              ? employee.value?.movies_list
              : 'N/A',
          },
          {
            label: 'Bücher',
            value: employee.value?.books_list?.[0]
              ? employee.value?.books_list
              : 'N/A',
          },
        ],
        [
          {
            label: 'Lieblingsgericht',
            value: employee.value?.food_list?.[0]
              ? employee.value?.food_list
              : 'N/A',
          },
          {
            label: 'Lieblingsgetränk',
            value: employee.value?.drink_list?.[0]
              ? employee.value?.drink_list
              : 'N/A',
          },
          {
            label: 'Lieblingsalkohol',
            value: employee.value?.alcohol_list?.[0]
              ? employee.value?.alcohol_list
              : 'N/A',
          },
          {
            label: 'Typische Kleidung',
            value: employee.value?.clothing_list?.[0]
              ? employee.value?.clothing_list
              : 'N/A',
          },
        ],
        [
          {
            label: `${getSexLabel(employee.value?.sex)?.pronoun} liebt`,
            value: employee.value?.loves_list?.[0]
              ? employee.value?.loves_list
              : 'N/A',
          },
          {
            label: `${getSexLabel(employee.value?.sex)?.pronoun} hasst`,
            value: employee.value?.hates_list?.[0]
              ? employee.value?.hates_list
              : 'N/A',
          },
        ],
      ],
    },
  ]
})

const sideTables = computed<ITables[]>(() => {
  if (!employee.value) return []
  return [
    {
      title: 'ArisCorp Informationen',
      icon: 'i-octicon-organization-24',
      data: [
        [
          {
            label: 'Organisationsposition',
            value: (employee.value?.role as DirectusRole)?.label ?? 'N/A',
          },
          {
            label: 'Rolle/n',
            value: getRolesLabel(employee.value?.roles ?? []) ?? 'N/A',
          },
        ],
        [
          // TODO: Abteilungslink
          {
            label: 'Primäre Abteilung',
            value:
              (employee.value?.primary_department as Department)?.name ?? 'N/A',
          },
          {
            label: 'Abteilungsposition',
            value: employee.value?.head_of_department
              ? 'Abteilungsleiter'
              : 'Mitarbeiter',
          },
          // TODO: Abteilungslink
          {
            label: 'Sekundäre Abteilung',
            value:
              (employee.value?.secondary_department as Department)?.name ??
              'N/A',
          },
        ],
        [
          {
            label: 'Mitglied seit',
            value: employee.value?.date_created
              ? new Intl.DateTimeFormat('de-DE', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
                  .format(new Date(employee.value?.date_created))
                  .replace(/\./g, '-')
              : 'N/A',
          },
          {
            label: 'Personalnummer',
            value: 'ARIS-ADM-50008001',
          },
        ],
        [
          {
            label: 'RSI-Handle',
            value: employee.value?.rsi_handle ?? 'N/A',
            link: employee.value?.rsi_handle
              ? `https://robertsspaceindustries.com/citizens/${employee.value?.rsi_handle}`
              : null,
          },
        ],
      ],
    },
  ]
})

const tabs = computed(() => [
  { label: 'Steckbrief', slot: 'profile' },
  ...(employee.value?.biography
    ? [{ label: 'Biografie', slot: 'biography' }]
    : []),
  ...(employee.value?.hangar_items?.length
    ? [{ label: 'Hangar', slot: 'hangar' }]
    : []),
])

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div v-if="employee">
    <AMSPageHeader
      icon="i-lucide-users-round"
      :title="`Mitarbeiter / ${getUserLabel(employee)}`"
      description="Detailansicht des Mitarbeiters"
    />

    <div class="grid xl:grid-cols-12 gap-6">
      <div class="col-span-12 xl:col-span-4 space-y-6">
        <UCard
          variant="ams"
          class="overflow-clip duration-300 transition-transform ease-out group"
          :ui="{
            header: '!p-0',
            root: 'flex flex-col relative',
            body: 'flex-1 !p-0',
          }"
        >
          <template #default>
            <div class="flex flex-col space-y-1.5 relative p-0 not-prose">
              <div class="relative w-full aspect-[270/320] overflow-hidden">
                <NuxtImg
                  :src="
                    getAssetId(
                      employee.avatar ?? '88adb941-f746-405d-bcc4-c2804fb48e33'
                    )
                  "
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 not-prose"
                />
                <!-- <div
              class="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white shadow-lg bg-gray-500"
            ></div> -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                ></div>
                <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h3
                    class="text-lg font-bold text-white group-hover:text-ariscorp-cyan transition-colors"
                  >
                    {{ getUserLabel(employee) }}
                  </h3>
                  <!-- <p class="text-sm font-medium text-ariscorp-orange">Commander</p> -->
                  <UBadge
                    v-if="employee.head_of_department"
                    variant="outline"
                    label="Abteilungsleiter"
                  />
                </div>
              </div>
            </div>
          </template>
        </UCard>

        <UCard
          v-for="(table, tableIndex) in sideTables"
          :key="tableIndex"
          variant="ams"
        >
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon :name="table.icon" class="size-5" />
              <h2>{{ table.title }}</h2>
            </div>
          </template>
          <template #default>
            <div class="space-y-4">
              <template v-for="(row, rowIndex) in table.data" :key="rowIndex">
                <div
                  v-for="(cell, cellIndex) in row"
                  :key="cellIndex"
                  class="flex justify-between items-center"
                >
                  <label
                    class="text-sm font-medium text-(--ui-text-muted) text-nowrap"
                  >
                    {{ cell.label }}
                  </label>
                  <NuxtLink
                    v-if="cell.link"
                    :to="cell.link ?? ''"
                    target="_blank"
                    class="not-prose w-fit active:scale-95 transition-all hover:scale-105"
                  >
                    <p
                      v-if="!Array.isArray(cell.value)"
                      class="mt-0 mb-0 uppercase font-mono ml-6 text-(--ui-primary)/50"
                    >
                      {{ cell.value }}
                    </p>
                  </NuxtLink>
                  <p
                    v-else
                    v-if="!Array.isArray(cell.value)"
                    class="mt-0 mb-0 uppercase not-prose font-mono ml-6"
                  >
                    {{ cell.value }}
                  </p>
                </div>
                <div
                  v-if="rowIndex < table?.data.length - 1"
                  class="col-span-2"
                >
                  <USeparator color="ams" />
                </div>
              </template>
            </div>
          </template>
        </UCard>
      </div>

      <div class="col-span-12 xl:col-span-8">
        <UTabs
          :items="tabs"
          class="w-full"
          :ui="{
            list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
            indicator: 'bg-(--ui-primary)/10',
            trigger: 'data-[state=active]:text-(--ui-primary)',
          }"
        >
          <template #profile>
            <div class="space-y-6">
              <UCard
                v-for="(table, tableIndex) in mainTables"
                :key="tableIndex"
                variant="ams"
              >
                <template #header>
                  <div class="flex items-center gap-2 ams-card-title">
                    <UIcon :name="table.icon" class="size-5" />
                    <h2>{{ table.title }}</h2>
                  </div>
                </template>
                <template #default>
                  <div class="grid grid-cols-2 gap-4">
                    <template
                      v-for="(row, rowIndex) in table.data"
                      :key="rowIndex"
                      class=""
                    >
                      <div v-for="(cell, cellIndex) in row" :key="cellIndex">
                        <label
                          class="text-sm font-medium text-(--ui-text-muted)"
                        >
                          {{ cell.label }}
                        </label>
                        <p
                          v-if="!Array.isArray(cell.value)"
                          class="mt-0 mb-0 uppercase font-mono"
                        >
                          {{ cell.value }}
                        </p>
                        <ul v-else class="mt-0 uppercase mb-0 font-mono">
                          <li
                            v-for="item in cell.value"
                            :key="item"
                            class="!my-0 marker:text-(--ui-primary) pl-0"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </div>
                      <div
                        v-if="rowIndex < table?.data.length - 1"
                        class="col-span-2"
                      >
                        <USeparator color="ams" />
                      </div>
                    </template>
                  </div>
                </template>
              </UCard>
            </div>
          </template>
          <template #biography>
            <div class="space-y-6">
              <UCard variant="ams">
                <template #header>
                  <div class="flex items-center gap-2 ams-card-title">
                    <UIcon name="i-lucide-letter-text" class="size-5" />
                    <h2>Biografie</h2>
                  </div>
                </template>
                <template #default>
                  <UiEditor
                    :readOnly="true"
                    :model-value="employee.biography ?? ''"
                  />
                </template>
              </UCard>
            </div>
          </template>
          <template #hangar>
            <div
              class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
            >
              <AMSUiShipCard
                v-for="ship in employee.hangar_items"
                :key="ship.id"
                mode="hangar-item"
                :data="ship as UserHangar"
                :fleetMode="true"
              />
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center min-h-[400px]">
    <div class="text-center">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 animate-spin text-muted-foreground mx-auto mb-4"
      />
      <p class="text-muted-foreground">Mitarbeiterdaten werden geladen...</p>
    </div>
  </div>
</template>
