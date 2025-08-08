<script setup lang="ts">
import type { DirectusUser } from '~~/types'

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
          { primary_department: ['name', 'logo', 'description'] },
          { secondary_department: ['name', 'logo', 'description'] },
          { leading_department: ['name', 'logo', 'description'] },
          { role: ['name', 'label', 'description'] },
        ],
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

const statusColor = computed(() => {
  if (!employee.value) return 'gray'
  switch (employee.value.status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'red'
    case 'suspended':
      return 'orange'
    default:
      return 'gray'
  }
})

const statusLabel = computed(() => {
  if (!employee.value) return 'Unbekannt'
  switch (employee.value.status) {
    case 'active':
      return 'Aktiv'
    case 'inactive':
      return 'Inaktiv'
    case 'suspended':
      return 'Suspendiert'
    default:
      return 'Unbekannt'
  }
})

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

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-4">
        <UCard
          variant="ams"
          class="overflow-clip"
          :ui="{
            header: '!p-0',
            root: 'flex flex-col relative',
            body: 'flex-1 !p-0',
          }"
        >
          <div class="relative aspect-[270/320] w-full">
            <NuxtImg
              :src="
                getAssetId(
                  employee.avatar ?? '88adb941-f746-405d-bcc4-c2804fb48e33'
                )
              "
              class="w-full h-full object-cover"
              :alt="`Avatar von ${getUserLabel(employee)}`"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h1 class="text-xl font-bold text-white mb-1">
                {{ getUserLabel(employee) }}
              </h1>
              <p class="text-sm text-ariscorp-orange font-medium">
                {{ employee.role?.label }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <UBadge variant="solid" :label="statusLabel" />
                <UBadge
                  v-if="employee.head_of_department"
                  variant="outline"
                  label="Abteilungsleiter"
                />
              </div>
            </div>
          </div>
        </UCard>

        Schnelle Fakten
        <UCard variant="ams" class="mt-6">
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon name="i-lucide-info" class="size-5" />
              <h2>Schnelle Fakten</h2>
            </div>
          </template>
          <template #default>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Mitglied seit</span>
                <span class="font-medium">{{ memberSinceFormatted }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground"
                  >Mitarbeiter-ID</span
                >
                <span class="font-mono text-sm">{{ employee.id }}</span>
              </div>
              <div
                v-if="employee.email"
                class="flex justify-between items-center"
              >
                <span class="text-sm text-muted-foreground">E-Mail</span>
                <a
                  :href="`mailto:${employee.email}`"
                  class="text-ariscorp-cyan hover:underline text-sm"
                >
                  {{ employee.email }}
                </a>
              </div>
              <div
                v-if="employee.location"
                class="flex justify-between items-center"
              >
                <span class="text-sm text-muted-foreground">Standort</span>
                <span class="font-medium">{{ employee.location }}</span>
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <div class="col-span-12 lg:col-span-8 space-y-6">
        <UCard variant="ams">
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon name="i-lucide-user" class="size-5" />
              <h2>Persönliche Informationen</h2>
            </div>
          </template>
          <template #default>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Vorname</label
                >
                <p class="mt-1 font-medium">
                  {{ employee.first_name || 'Nicht angegeben' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Nachname</label
                >
                <p class="mt-1 font-medium">
                  {{ employee.last_name || 'Nicht angegeben' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Titel</label
                >
                <p class="mt-1 font-medium">
                  {{ employee.title || 'Nicht angegeben' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Sprache</label
                >
                <p class="mt-1 font-medium">
                  {{ employee.language || 'Nicht angegeben' }}
                </p>
              </div>
            </div>
          </template>
        </UCard>

        <UCard variant="ams">
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon name="i-lucide-briefcase" class="size-5" />
              <h2>Rolle & Abteilung</h2>
            </div>
          </template>
          <template #default>
            <div class="space-y-6">
              Aktuelle Rolle
              <div v-if="employee.role">
                <label class="text-sm font-medium text-muted-foreground"
                  >Aktuelle Rolle</label
                >
                <div class="mt-2 p-4 bg-muted/50 rounded-lg">
                  <h3 class="font-semibold text-lg">
                    {{ employee.role.label }}
                  </h3>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ employee.role.name }}
                  </p>
                  <p v-if="employee.role.description" class="text-sm mt-2">
                    {{ employee.role.description }}
                  </p>
                </div>
              </div>

              Abteilungen
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                Hauptabteilung
                <div v-if="employee.primary_department">
                  <label class="text-sm font-medium text-muted-foreground">
                    {{
                      employee.head_of_department
                        ? 'Leitende Abteilung'
                        : 'Hauptabteilung'
                    }}
                  </label>
                  <div
                    class="mt-2 p-3 bg-muted/30 rounded-lg flex items-center gap-3"
                  >
                    <NuxtImg
                      v-if="employee.primary_department.logo"
                      :src="getAssetId(employee.primary_department.logo)"
                      class="size-10 rounded-full"
                      :alt="`Logo ${employee.primary_department.name}`"
                    />
                    <div>
                      <h4 class="font-medium">
                        {{ employee.primary_department.name }}
                      </h4>
                      <p
                        v-if="employee.primary_department.description"
                        class="text-xs text-muted-foreground"
                      >
                        {{ employee.primary_department.description }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="employee.secondary_department">
                  <label class="text-sm font-medium text-muted-foreground"
                    >Nebenabteilung</label
                  >
                  <div
                    class="mt-2 p-3 bg-muted/30 rounded-lg flex items-center gap-3"
                  >
                    <NuxtImg
                      v-if="employee.secondary_department.logo"
                      :src="getAssetId(employee.secondary_department.logo)"
                      class="size-10 rounded-full"
                      :alt="`Logo ${employee.secondary_department.name}`"
                    />
                    <div>
                      <h4 class="font-medium">
                        {{ employee.secondary_department.name }}
                      </h4>
                      <p
                        v-if="employee.secondary_department.description"
                        class="text-xs text-muted-foreground"
                      >
                        {{ employee.secondary_department.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UCard>
        <UCard v-if="employee.description" variant="ams">
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon name="i-lucide-file-text" class="size-5" />
              <h2>Biografie</h2>
            </div>
          </template>
          <template #default>
            <div class="prose prose-sm max-w-none">
              <p class="text-muted-foreground leading-relaxed">
                {{ employee.description }}
              </p>
            </div>
          </template>
        </UCard>

        Kontaktinformationen
        <UCard variant="ams">
          <template #header>
            <div class="flex items-center gap-2 ams-card-title">
              <UIcon name="i-lucide-contact" class="size-5" />
              <h2>Kontakt & Erreichbarkeit</h2>
            </div>
          </template>
          <template #default>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="employee.email">
                <label
                  class="text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <UIcon name="i-lucide-mail" class="size-4" />
                  E-Mail
                </label>
                <a
                  :href="`mailto:${employee.email}`"
                  class="mt-1 text-ariscorp-cyan hover:underline font-medium block"
                >
                  {{ employee.email }}
                </a>
              </div>

              <div v-if="employee.location">
                <label
                  class="text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <UIcon name="i-lucide-map-pin" class="size-4" />
                  Standort
                </label>
                <p class="mt-1 font-medium">{{ employee.location }}</p>
              </div>

              <div v-if="employee.timezone">
                <label
                  class="text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <UIcon name="i-lucide-clock" class="size-4" />
                  Zeitzone
                </label>
                <p class="mt-1 font-medium">{{ employee.timezone }}</p>
              </div>

              <div>
                <label
                  class="text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <UIcon name="i-lucide-calendar" class="size-4" />
                  Mitglied seit
                </label>
                <p class="mt-1 font-medium">{{ memberSinceFormatted }}</p>
              </div>
            </div>
          </template>
        </UCard>
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
