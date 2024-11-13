<script setup lang="ts">
const { query } = useRoute();

const crews = JSON.parse(query.crews);
const members = JSON.parse(query.members);
const expenses = JSON.parse(query.expenses);
// const incomes = JSON.parse(query.incomes);
// const steps = JSON.parse(query.steps);
// const options = JSON.parse(query.options);

console.log(crews);
// console.log(steps);
definePageMeta({
  layout: false,
});
</script>

<template>
  <div class="block w-screen px-4 font-semibold">
    <!-- <h2>Crews</h2>
    <ul>
      <li v-for="crew in crews">
        <span>Crew {{ crew?.id }}</span>
        <ul>
          <li>Schiff: {{ crew.ship.name }}</li>
          <li>Crewmitglieder:</li>
          <ul>
            <li v-for="member in members.filter((e) => e.crew.id === crew.id)" :key="member.id">
              {{ member.is_external ? member.external_name : member.user.full_name }}
            </li>
          </ul>
        </ul>
      </li>
    </ul>
    <h2>Ausgaben</h2>
    <div class="border rounded-lg overflow-clip border-btertiary">
      <table class="border-transparent table-fixed h-fit">
        <thead class="relative">
          <tr>
            <th class="text-left">Mitarbeiter</th>
            <th class="text-left">Betrag</th>
            <th class="text-left">Ausgabe</th>
          </tr>
        </thead>

        <tr v-for="expense in expenses" :key="expense.id">
          <td class="text-left border-r last:border-0 border-btertiary text-tbase/75">
            {{ expense.member?.is_external ? expense.member?.external_name : expense.member?.user?.full_name }}
          </td>
          <td class="text-left border-r last:border-0 border-btertiary">
            {{ expense.value }} <span class="text-tbase/75">aUEC</span>
          </td>
          <td class="relative text-left border-r last:border-0 border-btertiary">
            {{ expense.name }}
          </td>
        </tr>
      </table>
    </div>
    <h2>Einnahmen</h2>
    <div class="border rounded-lg overflow-clip border-btertiary">
      <table class="border-transparent table-fixed h-fit">
        <thead class="relative">
          <tr>
            <th class="text-left">Ausgabe</th>
            <th class="text-left">Betrag</th>
            <th class="text-left">Mitarbeiter</th>
          </tr>
        </thead>

        <tr v-for="income in incomes" :key="income.id">
          <td class="relative text-left border-r last:border-0 border-btertiary">
            {{ income.name }}
          </td>
          <td class="text-left border-r last:border-0 border-btertiary">
            {{ income.value }} <span class="text-tbase/75">aUEC</span>
          </td>
          <td class="text-left border-r last:border-0 border-btertiary text-tbase/75">
            {{ income.member?.is_external ? income.member?.external_name : income.member?.user?.full_name }}
          </td>
        </tr>
      </table>
    </div>
    <h3>Gesamteinnahmen: {{ steps.income_sum_before_expenses }}</h3>
    <h2>Ausschüttung</h2>
    <div class="border rounded-lg overflow-clip border-btertiary">
      <table class="border-transparent table-fixed h-fit">
        <thead class="relative">
          <tr>
            <th class="text-left">Mitarbeiter</th>
            <th class="text-left">Anteil (abzgl. {{ options.tax_rate * 100 }}% Transaktionsgebühr)</th>
          </tr>
        </thead>

        <tr v-for="member in steps.members" :key="income.id">
          <td class="relative text-left border-r last:border-0 border-btertiary">
            {{ member.is_external ? member.external_name : member.user.full_name }}
          </td>
          <td class="text-left border-r last:border-0 border-btertiary">
            {{ member.value }} <span class="text-tbase/75">aUEC</span>
          </td>
        </tr>
      </table>
    </div> -->
  </div>
</template>

<style>
#sentry-feedback {
  display: none;
}
</style>
