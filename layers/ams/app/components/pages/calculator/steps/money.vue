<script setup lang="ts">
import type { DirectusUsers } from '~~/types'

defineProps<{ users: DirectusUsers[] }>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-currency" class="text-(--ui-success) size-4" />
      Einnahmen
    </div>
    <AMSPagesCalculatorTablesIncome :users="users" />
    <AMSUiCardSeparator />
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-currency" class="text-(--ui-primary) size-4" />
      Ausgaben
    </div>
    <AMSPagesCalculatorTablesExpense :users="users" />
  </div>
</template>
