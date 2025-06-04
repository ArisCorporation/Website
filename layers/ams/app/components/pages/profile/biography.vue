<script setup lang="ts">
const store = useUserProfileEditStore()

interface gender {
  label: string
  value: string | null
}

const genderOptions = reactive<gender[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <template #header>
      <div class="prose-h4:my-0 prose-p:my-0">
        <h4>Biografie</h4>
        <p class="text-xs pt-1 text-(--ui-text-muted)">
          Deine persönliche Biografie
        </p>
      </div>
    </template>
    <template #default>
      <div>
        <UFormField name="biography" class="w-full">
          <UiEditor
            v-model="store.formData.biography"
            class="h-[calc(100vh_-_75px)]"
          />
        </UFormField>
      </div>
    </template>
  </UCard>
</template>
