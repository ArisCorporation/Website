<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-currency" class="text-(--ui-success) size-4" />
      Einnahmen
    </div>
    <AMSPagesCalculatorIncomeTable />
    <AMSUiCardSeparator />
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-currency" class="text-(--ui-primary) size-4" />
      Ausgaben
    </div>
    <AMSPagesCalculatorExpenseTable />
  </div>
</template>
