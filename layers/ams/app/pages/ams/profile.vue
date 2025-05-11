<script setup lang="ts">
interface title {
  label: string
  value: string | null
}
interface gender {
  label: string
  value: string | null
}

const titleOptions = reactive<title[]>([
  { label: 'Kein Titel', value: null },
  { label: 'Dr. Med.', value: 'Dr. Med.' },
])

const roleOptions = reactive<string[]>([
  'Rekrutierung',
  'Marketing & Presse',
  'Inhaltsersteller',
])

const genderOptions = reactive<gender[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-user"
      title="Profil"
      description="Verwalte deine persönlichen Details und Biografie."
    />
    <div class="space-y-6">
      <!-- <UForm> -->
      <UCard variant="ams" class="animated-border">
        <template #header>
          <div class="prose-h4:my-0 prose-p:my-0">
            <h4>Persönliche Daten</h4>
            <p class="text-xs pt-1 text-(--ui-text-muted)">Deine Identität</p>
          </div>
        </template>
        <template #default>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Vorname"
              required
              name="first_name"
              size="xs"
              class="w-full"
            >
              <UInput highlight size="md" placeholder="Chris" class="w-full" />
            </UFormField>
            <UFormField
              label="Zweiter Vorname"
              name="middle_name"
              hint="Optional"
              size="xs"
              class="w-full"
            >
              <UInput highlight size="md" placeholder="Chris" class="w-full" />
            </UFormField>
            <UFormField
              label="Nachname"
              name="last_name"
              hint="Optional"
              size="xs"
              class="w-full"
            >
              <UInput
                highlight
                size="md"
                placeholder="Roberts"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Benutzername"
              name="slug"
              size="xs"
              class="w-full"
            >
              <UInput
                disabled
                highlight
                size="md"
                placeholder="chris.roberts"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Avatar" name="avatar" size="xs" class="w-full">
              <UInput
                highlight
                size="md"
                placeholder="chris.roberts"
                type="file"
                accept="image/*"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Titel"
              hint="Optional"
              name="title"
              size="xs"
              class="w-full"
            >
              <USelectMenu
                :items="titleOptions"
                variant="ams"
                size="md"
                placeholder="z.B. Dr. Med."
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Passwort"
              name="password"
              size="xs"
              class="w-full"
            >
              <UInput
                highlight
                size="md"
                placeholder="************"
                type="password"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="RSI Handle"
              name="rsi_handle"
              size="xs"
              class="w-full"
            >
              <UInput
                highlight
                size="md"
                placeholder="chris_roberts"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>
      </UCard>
      <UCard variant="ams" class="animated-border">
        <template #header>
          <div class="prose-h4:my-0 prose-p:my-0">
            <h4>Orga Informationen</h4>
            <p class="text-xs pt-1 text-(--ui-text-muted)">
              Organisationsbezogene Daten
            </p>
          </div>
        </template>
        <template #default>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Abteilung"
              name="department"
              size="xs"
              class="w-full"
            >
              <USelectMenu
                :items="titleOptions"
                variant="ams"
                size="md"
                placeholder="z.B. Logistik"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Rollen"
              name="roles"
              size="xs"
              class="w-full prose-p:my-0"
            >
              <UCheckboxGroup
                disabled
                orientation="horizontal"
                :items="roleOptions"
                class="translate-y-2"
              />
            </UFormField>
          </div>
        </template>
      </UCard>
      <UCard variant="ams" class="animated-border">
        <template #header>
          <div class="prose-h4:my-0 prose-p:my-0">
            <h4>Basis Informationen</h4>
            <p class="text-xs pt-1 text-(--ui-text-muted)">
              Basis Informationen zu der Person
            </p>
          </div>
        </template>
        <template #default>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Geschlecht"
              name="gender"
              size="xs"
              class="w-full"
            >
              <URadioGroup
                indicator="hidden"
                variant="table"
                orientation="horizontal"
                default-value="male"
                :items="genderOptions"
                class="prose-p:my-0"
              />
            </UFormField>
            <UFormField
              label="Geburtsdatum"
              name="birthdate"
              size="xs"
              class="w-full"
            >
              <div class="grid grid-cols-3 gap-x-4">
                <UFormField
                  label="Tag"
                  name="birthdate_day"
                  size="xs"
                  class="w-full"
                >
                  <USelectMenu
                    :items="
                      Array.from({ length: 31 }, (_, index) =>
                        (index + 1).toString().padStart(2, '0')
                      )
                    "
                    variant="ams"
                    size="md"
                    placeholder="1-31"
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
                    :items="[
                      { name: 'Januar', value: '01' },
                      { name: 'Februar', value: '02' },
                      { name: 'März', value: '03' },
                      { name: 'April', value: '04' },
                      { name: 'Mai', value: '05' },
                      { name: 'Juni', value: '06' },
                      { name: 'Juli', value: '07' },
                      { name: 'August', value: '08' },
                      { name: 'September', value: '09' },
                      { name: 'Oktober', value: '10' },
                      { name: 'November', value: '11' },
                      { name: 'Dezember', value: '12' },
                    ]"
                    variant="ams"
                    size="md"
                    placeholder="Januar"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Jahr"
                  name="birthdate_year"
                  size="xs"
                  class="w-full"
                >
                  <UInput highlight size="md" class="w-full" />
                </UFormField>
              </div>
            </UFormField>
          </div>
        </template>
      </UCard>
      <!-- </UForm> -->
    </div>
  </div>
</template>
