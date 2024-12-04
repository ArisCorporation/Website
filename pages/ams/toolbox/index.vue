<script setup lang="ts">
import type { DirectusUsers, Ships } from '~/types/cms-types';
const { directus, readMe, readUsers, readItems } = useCMS();
const modalStore = useModalStore();
const calculatorStore = useCalculatorStore();
// https://regolith.rocks/workorder
const tabs = [
  // { id: 0, header: 'Schiffs Bergbau', icon: 'game-icons:rock' },
  // { id: 1, header: 'ROC/Hand Bergbau', icon: 'game-icons:diamond-hard' },
  // { id: 2, header: 'Schrott Sammlung', icon: 'game-icons:ship-wreck' },
  // { id: 3, header: 'Custom Rechner', icon: 'mdi:square-inc-cash' },
  { id: 0, header: 'aUEC Anteilsrechner', icon: 'IconsLogosUec' },
];
const selectedTab = ref(0);
const changeTab = (index) => {
  selectedTab.value = index;
};

const { data: me } = await useAsyncData('AMS:CALC_ME', () => directus.request(readMe()), {
  transform: (user: any) => transformUser(user),
});

const { data: users } = await useAsyncData(
  'AMS:CALC_USERS',
  () =>
    directus.request(
      readUsers({
        fields: ['id', 'first_name', 'last_name', 'avatar'],
        filter: {
          hidden: { _eq: false },
        },
        limit: -1,
        sort: ['first_name'],
      }),
    ),
  {
    transform: (users: any[]) => users.map((user: any) => transformUser(user)),
  },
);
const { data: ships } = await useAsyncData(
  'AMS:CALC_SHIPS',
  () =>
    directus.request(
      readItems('ships', {
        fields: ['id', 'name', 'manufacturer.name'],
        limit: -1,
        sort: ['name'],
      }),
    ),
  {
    transform: (ships: any[]) => ships.map((ship: any) => transformShip(ship)),
  },
);

type imember = {
  id: number;
  user: DirectusUsers | null;
  is_external: boolean;
  crew: string | null;
  external_name?: string;
};

const incomes = ref<{ id: number; name: string; value: number; member?: imember }[]>([{ id: 1, name: '', value: 0 }]);
const expenses = ref<{ id: number; name: string; value: number; member?: string }[]>([{ id: 1, name: '', value: 0 }]);
const options = ref<{
  name: string;
  subtract_tax: boolean;
  tax_rate: number;
  edit_tax: boolean;
  members: imember[];
  manager: imember | null;
  crews: { id: number; name: string; ship: Ships | null }[];
}>({
  name: '',
  subtract_tax: true,
  tax_rate: 0.05,
  edit_tax: false,
  members: [{ id: 1, user: me.value, crew: null, is_external: false }],
  manager: { id: 1, user: me.value, crew: null, is_external: false },
  crews: [
    {
      id: 1,
      name: '',
      ship: null,
    },
  ],
});

const crewIdCounter = ref(2);
const memberIdCounter = ref(2);
const incomeIdCounter = ref(2);
const expenseIdCounter = ref(2);

function addCrew() {
  // Generate a unique ID
  let newId = crewIdCounter.value;

  // Ensure the ID does not already exist in crews
  while (options.value.crews.some((crew) => crew.id === newId)) {
    newId = crewIdCounter.value++;
  }

  // Add the new crew member with a unique ID
  options.value.crews.push({
    id: newId,
    name: '',
    ship: '',
  });

  // Increment the counter for the next crew member
  crewIdCounter.value++;
}
function removeCrew(crew: { id: number; name: string; ship: string }) {
  const index = options.value.crews.findIndex((e) => e.id === crew.id);
  options.value.crews.splice(index, 1);
}

function addMember() {
  // Generate a unique ID
  let newId = memberIdCounter.value;

  // Ensure the ID does not already exist in members
  while (options.value.members.some((member) => member.id === newId)) {
    newId = memberIdCounter.value++;
  }

  // Add the new member with a unique ID
  options.value.members.push({
    id: newId,
    user: {
      id: '',
      first_name: '',
      last_name: '',
    },
    crew: '',
    external: false,
    external_name: '',
  });

  // Increment the counter for the next member
  memberIdCounter.value++;
}
function removeMember(member: { id: number; user: DirectusUsers; crew: string }) {
  const index = options.value.members.findIndex((e) => e.id === member.id);
  options.value.members.splice(index, 1);
}

function addIncome() {
  // Generate a unique ID
  let newId = incomeIdCounter.value;

  // Ensure the ID does not already exist in incomes
  while (incomes.value.some((income) => income.id === newId)) {
    newId = incomeIdCounter.value++;
  }

  // Add the new income with a unique ID
  incomes.value.push({
    id: newId,
    name: '',
    value: 0,
    member: options.value.members.find((m) => m.user?.id === me.value?.id),
  });

  // Increment the counter for the next income
  incomeIdCounter.value++;
}
function removeIncome(income: { id: number; name: string; value: number; member?: string }) {
  const index = incomes.value.findIndex((e) => e.id === income.id);
  incomes.value.splice(index, 1);
}

function addExpense() {
  // Generate a unique ID
  let newId = expenseIdCounter.value;

  // Ensure the ID does not already exist in expenses
  while (expenses.value.some((expense) => expense.id === newId)) {
    newId = expenseIdCounter.value++;
  }

  // Add the new expense with a unique ID
  expenses.value.push({
    id: newId,
    name: '',
    value: 0,
    member: options.value.members.find((m) => m.user?.id === me.value?.id),
  });

  // Increment the counter for the next expense
  expenseIdCounter.value++;
}
function removeExpense(expense: { id: number; name: string; value: number; member?: string }) {
  const index = expenses.value.findIndex((e) => e.id === expense.id);
  expenses.value.splice(index, 1);
}

const modalData = ref({});
function openSelectMember(type: 'income' | 'expense', object) {
  modalData.value.object = object;
  modalStore.openModal('Benutzer auswählen', {});
}
function selectMember(type: 'income' | 'expense', member) {
  modalData.value.object.member = member;
  modalStore.closeModal();
}

type StepMember = {
  member: any;
  value: number;
  value_without_tax: number;
};

const steps = ref({
  incomes: [] as any[],
  income_sum: 0,
  expenses: [] as any[],
  members: [] as StepMember[],
  income_sum_before_expenses: 0,
  share: 0,
});
function calculate() {
  console.log('calc');
  steps.value.incomes = [];
  steps.value.expenses = [];
  steps.value.members = [];

  incomes.value
    .filter((e) => e.member?.id !== options.value?.manager?.id)
    .forEach((e) => {
      steps.value.incomes.push({
        name: e.name,
        member: e.member,
        value: Math.floor(Number(e.value) * (1 - options.value.tax_rate)),
        value_without_tax: Number(e.value),
      });
    });

  incomes.value
    .filter((e) => e.member?.id === options.value?.manager?.id)
    .forEach((e) => {
      steps.value.incomes.push({
        name: e.name,
        member: e.member,
        value: Number(e.value),
        value_without_tax: Number(e.value),
      });
    });

  steps.value.income_sum_before_expenses = Math.floor(Number(steps.value.incomes.reduce((a, b) => a + b.value, 0)));
  steps.value.income_sum = Number(steps.value.income_sum_before_expenses);

  expenses.value.forEach((e: any) => {
    if (steps.value.members.find((m: any) => m.member.id === e.member?.id)) {
      const member = steps.value.members.find((m: any) => m.member.id === e.member?.id);
      if (member) {
        member.value = Number(member.value) + Number(e.value);
        member.value_without_tax = Number(member.value_without_tax) + Number(e.value);
        steps.value.income_sum = Number(steps.value.income_sum) - Number(e.value);
      }
    } else {
      steps.value.members.push({
        member: e.member,
        value: Number(e.value),
        value_without_tax: Number(e.value),
      });
      steps.value.income_sum = Number(steps.value.income_sum) - Number(e.value);
    }

    steps.value.expenses.push({
      name: e.name,
      member: e.member,
      value: Number(e.value) * (1 - options.value.tax_rate),
      value_without_tax: Number(e.value),
    });
  });

  steps.value.share = Math.floor(Number(steps.value.income_sum) / (steps.value.members.length + 1));

  options.value.members.forEach((e) => {
    if (steps.value.members.find((m: any) => m.member.id === e.id)) {
      const member = steps.value.members.find((m: any) => m.member.id === e.id);
      if (member) {
        member.value =
          e.id === options.value.manager.id
            ? Number(member.value) + Number(steps.value.share)
            : Math.floor((Number(member.value) + Number(steps.value.share)) * (1 - options.value.tax_rate));
        member.value_without_tax = Number(member.value_without_tax) + Number(steps.value.share);
      }
    } else {
      console.log('Create new member', e);
      steps.value.members.push({
        member: e,
        value:
          e.id === options.value.manager.id
            ? Math.floor(steps.value.share)
            : Math.floor(Number(steps.value.share) * (1 - options.value.tax_rate)),
        value_without_tax: Number(steps.value.share),
      });
    }
  });

  console.log(steps);
}

function openHelpModal() {
  modalStore.setData({ mode: 'manual' });
  modalStore.openModal('Anleitung', {});
}

const generatePdf = async () => {
  const htmlContent = `
   <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet">
        <style>
          :root {
            background-color: #111111;
            font-family: Orbitron, sans-serif;
            color: white;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          
          table {
            width: 100%;
            text-align: left;
            table-layout: auto;
            min-width: max-content;
            height: 100%;
            overflow-x: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background-clip: border-box;
            border: 1px solid #222222; /* border-bg-600 */
          }

          th {
            padding: 1rem;
            border-bottom: 1px solid #444444; /* border-btertiary */
            background-color: #111111; /* bg-bg-800 */
          }

          tbody {
            border: 1px solid #222222; /* border-bg-600 */
          }

          tr:nth-child(odd) {
            background-color: #222222; /* odd:bg-bg-600 */
          }

          table tr:last-child td:first-child {
            border-bottom-left-radius: 0.375rem;
          }

          table tr:last-child td:last-child {
            border-bottom-right-radius: 0.375rem;
          }

          td {
            padding: 1rem;
          }

          ul {
            list-style-type: disc;
            padding-left: 1rem;
          }
          ul ul {
            list-style-type: circle;
            padding-left: 1rem;
          }

          ul ul ul {
            list-style-type: square;
            padding-left: 1rem;
          }

          ol {
            list-style-type: decimal;
            padding-left: 1rem;
          }
          ol ol {
            list-style-type: lower-latin;
            padding-left: 1rem;
          }
          ol ol ol {
            list-style-type: lower-roman;
            padding-left: 1rem;
          }

          ol li {
            padding-bottom: 0.5rem;
          }

          ul li::marker {
            color: #00ffe8; /* Farbe des Markers (z.B. primary-400) */
          }

          ul li {
            padding-bottom: 0.5rem; /* Beispiel für Abstand unter Listenpunkt */
          }
        </style>
      </head>
      <body>
        <div style="display: block; padding-left: 16px; padding-right: 16px; font-weight: 600; padding-top: 1px">
          <h1>${options.value.name}</h1>
          <h2>Crews</h2>
          <ul>
            ${options.value.crews
              .map(
                (crew) => `
               <li>
                Crew ${crew.id} - ${crew.name}
                <ul>
                  <li>Schiff: ${crew.ship?.name}</li>
                  <li>Crewmitglieder:</li>
                  <ul>
                    ${steps.value.members
                      .filter((member) => member.member?.crew?.id === crew.id)
                      .map(
                        (member) => `
                          <li>${member.member?.user?.full_name}</li>
                        `,
                      )
                      .join('')}
                  </ul>
                </ul>
              </li>
              `,
              )
              .join('')}
          </ul>
          <h2>Ausgaben</h2>
          <div style="border: 1px solid #444; border-radius: 0.5rem; overflow: clip;">
            <table style="border-color: transparent; table-layout: fixed; height: fit-content;">
              <thead style="position: relative">
                <tr>
                  <th style="text-align: left">Mitarbeiter</th>
                  <th style="text-align: left">Betrag</th>
                  <th style="text-align: left">Ausgabe</th>
                </tr>
              </thead>

              ${steps.value.expenses
                .map(
                  (expense) => `
                  <tr>
                    <td style="padding: 5px; text-align: left">${
                      expense.member?.is_external ? expense.member?.external_name : expense.member?.user?.full_name
                    }</td>
                    <td style="padding: 5px; text-align: left">${
                      expense.value
                    } <span style="opacity: .75;">aUEC</span></td>
                    <td style="padding: 5px; text-align: left">${expense.name}</td>
                  </tr>
                `,
                )
                .join('')}
            </table>
          </div>
          <h2>Einnahmen</h2>
          <div style="border: 1px solid #444; border-radius: 0.5rem; overflow: clip;">
            <table style="border-color: transparent; table-layout: fixed; height: fit-content">
              <thead style="position: relative">
                <tr>
                  <th style="text-align: left">Ausgabe</th>
                  <th style="text-align: left">Betrag</th>
                  <th style="text-align: left">Mitarbeiter</th>
                </tr>
              </thead>

              ${steps.value.incomes
                .map(
                  (income) => `
                  <tr>
                    <td style="padding: 5px; text-align: left">${income.name}</td>
                    <td style="padding: 5px; text-align: left">${
                      income.value
                    } <span style="opacity: .75;">aUEC</span></td>
                    <td style="padding: 5px; text-align: left">${
                      income.member?.is_external ? income.member?.external_name : income.member?.user?.full_name
                    }</td>
                  </tr>
                `,
                )
                .join('')}
            </table>
          </div>
          <h3>Gesamteinnahmen: ${steps.value.income_sum_before_expenses} aUEC</h3>
          <h2>Ausschüttung</h2>
          <div style="border: 1px solid #444; border-radius: 0.5rem; overflow: clip;">
            <table style="border-color: transparent; table-layout: fixed; height: fit-content">
              <thead style="position: relative">
                <tr>
                  <th style="text-align: left">Mitarbeiter</th>
                  <th style="text-align: left">Anteil <span style="font-size: 0.7rem">(abzgl. ${
                    options.value.tax_rate * 100
                  }% Transaktionsgebühr)</span></th>
                </tr>
              </thead>

              ${steps.value.members
                .map(
                  (member) => `
                  <tr>
                    <td style="padding: 5px; text-align: left">${
                      member.member?.is_external ? member.member?.external_name : member.member?.user?.full_name
                    }</td>
                    <td style="padding: 5px; text-align: left">${
                      member.value
                    } <span style="opacity: .75;">aUEC</span></td>
                  </tr>
                `,
                )
                .join('')}
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  // Request an die Nuxt-API
  const response = await fetch('/api/ams/toolbox/generateCalculatorReport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ htmlContent }),
  });

  if (response.ok) {
    const pdfBlob = await response.blob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } else {
    console.error('Fehler bei der PDF-Erstellung');
  }
};

definePageMeta({
  middleware: 'auth',
  layout: false,
});

useHead({
  title: 'Anteilsrechner',
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <div v-if="modalStore.data?.mode !== 'manual'">
        <table>
          <thead class="relative">
            <tr>
              <th class="text-left">Extern</th>
              <th class="text-left">Name</th>
              <th class="text-left">Crew</th>
            </tr>
          </thead>

          <tr
            v-for="member in options.members.sort(
              (a, b) =>
                (a.is_external ? a.external_name : a.user.first_name)?.localeCompare(
                  b.is_external ? b.external_name ?? '' : b.user.first_name ?? '',
                ) ?? 0,
            )"
            :key="member.id"
            class="!bg-bg-800 hover:!bg-bg-600 hover:cursor-pointer border border-btertiary"
            @click="selectMember('income', member)"
          >
            <td class="text-left border-r last:border-0 border-btertiary text-neutral-200/75">
              {{ member.is_external ? 'Ja' : 'Nein' }}
            </td>
            <td class="text-left border-r last:border-0 border-btertiary">
              {{ member.is_external ? member.external_name : member.user.full_name }}
            </td>
            <td class="relative text-left border-r last:border-0 border-btertiary">
              {{ options.crews.find((e) => e.id === member.crew)?.name }}
            </td>
          </tr>
        </table>
      </div>
      <div v-else>
        <div>
          <h4>Schritt 1 – Einstellungen</h4>
          <p>Als erstes solltest du die grundlegenden Einstellungen vornehmen.</p>
          <p>
            Besonders wichtig sind die Mitarbeiter. Diese können später noch erweitert werden, falls neue Mitarbeiter
            hinzukommen.
          </p>
          <p class="font-bold">
            Hinweis: Das Manager-Häkchen bei einem Mitarbeiter bedeutet, dass bei diesem Mitarbeiter alle Einkünfte
            zusammenlaufen und er für die Verteilung verantwortlich ist.
          </p>
          <p>Die Crew-Zuweisung ist besonders nützlich, um den Überblick zu behalten und alles gut zu dokumentieren.</p>

          <h4>Schritt 2 – Einkommen</h4>
          <p>
            Nun kannst du nach und nach die Einkünfte eintragen, wie zum Beispiel Verkaufserträge. Wichtig ist, das
            korrekte Mitarbeiter auszuwählen, das die Einnahme getätigt hat.
          </p>
          <p class="font-bold">Hinweis: Gleitkommazahlen sind nicht zulässig.</p>

          <h4>Schritt 3 – Ausgaben</h4>
          <p>
            Bei den Ausgaben ist es ebenso wichtig, das richtige Mitarbeiter zuzuordnen, damit die Ausgaben entsprechend
            berücksichtigt werden.
          </p>

          <h4>Schritt 4 – Verteilung</h4>
          <p>
            Bei der Verteilung ist zu beachten, dass eventuelle Überweisungsgebühren (sofern in den Einstellungen
            aktiviert) bereits abgezogen wurden. Der Manager sollte also diesen Betrag an die jeweiligen Mitarbeiter
            überweisen.
          </p>
        </div>
      </div>
    </template>
    <div>
      <TabGroup :tablist="tabs" :store="selectedTab" :change="changeTab">
        <template #tablist>
          <div class="grid grid-cols-1 mx-auto w-fit">
            <button
              v-for="(tab, index) in tabs"
              :key="index"
              class="w-32 h-32 transition border first:rounded-l last:rounded-r !outline-none"
              :class="[
                selectedTab === tab.id
                  ? 'shadow-[0_0px_30px_5px_rgba(228,134,50,0.3)] hover:shadow-[0_0px_50px_5px_rgba(228,134,50,0.3)] z-10 border-industrial-400 bg-industrial-400/50 hover:bg-industrial-400/25'
                  : 'border-btertiary hover:bg-bg-600/75',
              ]"
              @click="changeTab(tab.id)"
            >
              <div
                class="flex flex-col m-auto text-white transition gap-y-4 w-fit h-fit"
                :class="{ 'opacity-50': selectedTab !== tab.id }"
              >
                <Icon :name="tab.icon" class="block w-12 h-12 mx-auto" />
                <p class="p-0 text-sm h-fit">{{ tab.header }}</p>
              </div>
            </button>
          </div>
        </template>
        <template #tabcontent>
          <!-- <template v-if="selectedTab === 0">
            <h2 class="m-0 text-center">Schiffs Bergbau</h2>
            <h3 class="italic text-center text-neutral-200/75">COMMING-SOON</h3>
          </template>
          <template v-if="selectedTab === 1">
            <h2 class="m-0 text-center">ROC/Hand Bergbau</h2>
            <h3 class="italic text-center text-neutral-200/75">COMMING-SOON</h3>
          </template>
          <template v-if="selectedTab === 2">
            <h2 class="m-0 text-center">Schrott Sammlung</h2>
            <div class="grid grid-cols-3 px-6 gap-x-4">
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Einstellungen</p>
                </template>
              </UCard>
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Materialien</p>
                </template>
              </UCard>
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Verteilung</p>
                </template>
              </UCard>
            </div>
          </template> -->
          <!-- <template v-if="selectedTab === 3"> -->
          <template v-if="selectedTab === 0">
            <h1 class="text-center">aUEC Anteilsrechner - BETA</h1>
            <div class="grid grid-cols-4 px-6 gap-x-4">
              <UCard class="col-span-1 h-[1000px] overflow-y-auto overflow-x-clip">
                <template #header>
                  <p class="p-0 text-2xl text-center">Einstellungen</p>
                </template>
                <template #default>
                  <div class="-mx-3 space-y-4">
                    <UButton variant="outline" class="float-right" @click="openHelpModal()">Hilfe öffnen</UButton>
                    <UFormGroup>
                      <h3>Name der Mission</h3>
                      <UInput v-model="options.name" placeholder="Titel" size="lg" class="relative" />
                    </UFormGroup>
                    <h3>Transaktionsgebühr</h3>
                    <UCheckbox v-model="options.subtract_tax" disabled name="subtract_tax" label="Gebühren abziehen" />
                    <div class="flex justify-between">
                      <UCheckbox
                        v-model="options.edit_tax"
                        :disabled="!options.subtract_tax"
                        name="edit_tax"
                        label="Gebühren bearbeiten"
                      />
                      <UInput
                        v-model="options.tax_rate"
                        :disabled="!options.edit_tax"
                        placeholder="Gebührensatz"
                        icon="i-ic-outline-percentage"
                        trailing
                        size="sm"
                      />
                    </div>
                    <UFormGroup name="crews">
                      <h3>Crews</h3>
                      <div class="p-1">
                        <table>
                          <thead class="relative">
                            <tr>
                              <th class="text-left">#</th>
                              <th class="text-left">Name</th>
                              <th class="text-left">Schiff</th>
                            </tr>
                            <button
                              class="absolute top-0 bottom-0 my-auto transition-all opacity-50 right-2 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                              @click="addCrew"
                            >
                              <UIcon name="i-heroicons-plus-small-solid" class="size-full" />
                            </button>
                          </thead>

                          <tr v-for="crew in options.crews" :key="crew.id">
                            <td class="text-left border-r last:border-0 border-btertiary text-neutral-200/75">
                              {{ crew.id }}
                            </td>
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UInput v-model="crew.name" placeholder="Name eingeben" size="sm" class="relative w-28" />
                            </td>
                            <td class="relative text-left border-r last:border-0 border-btertiary">
                              <ArisSelectMenu
                                v-model="crew.ship"
                                :options="ships"
                                size="sm"
                                no-selected-label="Schiff"
                                :option-label="(option: any) => option.name"
                                :selected-label="crew.ship?.name ? crew.ship.name : 'Kein Schiff'"
                                empty-label="Kein Schiff"
                                no-icons
                                class="w-28"
                                searchable
                                searchable-placeholder="Suche..."
                                :search-attributes="['name', 'manufacturer.name']"
                              />
                              <button
                                class="absolute top-0 bottom-0 right-0 my-auto transition-all opacity-50 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                                @click="removeCrew(crew)"
                              >
                                <UIcon name="i-heroicons-x-mark" class="size-full" />
                              </button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </UFormGroup>
                    <UFormGroup name="members">
                      <h3>Mitarbeiter</h3>
                      <div class="p-1">
                        <table>
                          <thead class="relative">
                            <tr>
                              <th class="text-left">
                                <UTooltip text="Manager"> M.. </UTooltip>
                              </th>
                              <th class="text-left">
                                <UTooltip text="Extern"> E.. </UTooltip>
                              </th>
                              <th class="text-left">Mitarbeiter</th>
                              <th class="text-left">
                                <UTooltip text="Crew"> C.. </UTooltip>
                              </th>
                            </tr>
                            <button
                              class="absolute top-0 bottom-0 my-auto transition-all opacity-50 right-2 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                              @click="addMember"
                            >
                              <UIcon name="i-heroicons-plus-small-solid" class="size-full" />
                            </button>
                          </thead>
                          <tr v-for="member in options.members" :key="member.id">
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UButton
                                :icon="
                                  options.manager?.user?.id && options.manager?.user?.id === member.user?.id
                                    ? 'i-heroicons-check'
                                    : 'i-oui-empty'
                                "
                                :color="
                                  options.manager?.user?.id && options.manager?.user?.id === member.user?.id
                                    ? 'primary'
                                    : 'gray'
                                "
                                size="xxs"
                                :disabled="member.is_external"
                                @click="options.manager = member"
                              />
                            </td>
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UCheckbox
                                v-model="member.is_external"
                                name="is_external"
                                @change="
                                  () => {
                                    member.user = null;
                                    if (options.manager?.id === member.id) {
                                      options.manager = null;
                                    }
                                  }
                                "
                              />
                            </td>
                            <td class="relative text-left border-r last:border-0 border-btertiary">
                              <UInput
                                v-if="member.is_external"
                                v-model="member.external_name"
                                placeholder="Name eingeben"
                                size="sm"
                                class="relative w-32"
                              />
                              <ArisSelectMenu
                                v-if="!member.is_external"
                                v-model="member.user"
                                :options="users"
                                size="sm"
                                no-selected-label="Benutzer"
                                :option-label="(option: any) => option.full_name"
                                :selected-label="member.user?.first_name ? member.user?.first_name : 'Kein Benutzer'"
                                empty-label="Kein Benutzer"
                                no-icons
                                class="w-28"
                                searchable
                                searchable-placeholder="Suche..."
                                :search-attributes="['first_name', 'last_name']"
                                @change="
                                  () => {
                                    if (options.manager?.id === member.id) {
                                      options.manager = null;
                                    }
                                  }
                                "
                              />
                            </td>
                            <td class="relative text-left border-r last:border-0 border-btertiary">
                              <ArisSelectMenu
                                v-model="member.crew"
                                :options="options.crews"
                                size="sm"
                                no-selected-label="C"
                                :option-label="(option: any) => option.id"
                                :selected-label="member.crew?.id"
                                no-icons
                                class="w-12"
                              />
                              <button
                                class="absolute top-0 bottom-0 right-0 my-auto transition-all opacity-50 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                                @click="removeMember(member)"
                              >
                                <UIcon name="i-heroicons-x-mark" class="size-full" />
                              </button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </UFormGroup>
                  </div>
                </template>
              </UCard>
              <UCard class="col-span-2 h-[1000px] overflow-y-auto overflow-x-clip">
                <template #header>
                  <p class="p-0 text-2xl text-center">Einkommen / Ausgaben</p>
                </template>
                <template #default>
                  <div>
                    <div class="border divide-y rounded border-btertiary divide-btertiary">
                      <div class="relative py-2">
                        <p class="text-xl text-center">Einkommen</p>
                        <button class="absolute top-0 bottom-0 my-auto right-2 size-8" @click="addIncome()">
                          <UIcon
                            name="i-heroicons-plus-small-solid"
                            class="opacity-50 size-full hover:opacity-100 animate-link hover:cursor-pointer"
                          />
                        </button>
                      </div>
                      <div class="p-1 overflow-y-scroll h-[324px]">
                        <table class="h-fit">
                          <tr>
                            <th class="text-left">Name</th>
                            <th class="text-left">Einkommen</th>
                            <th class="text-left">Mitarbeiter</th>
                          </tr>
                          <tr v-for="income in incomes" :key="income.id">
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UInput
                                v-model="income.name"
                                placeholder="Name eingeben"
                                size="sm"
                                class="relative w-40"
                              />
                            </td>
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UInput
                                v-model="income.value"
                                placeholder="Ausgabe eingeben"
                                size="sm"
                                class="relative w-40"
                                :ui="{
                                  trailing: {
                                    padding: {
                                      sm: 'pe-14',
                                    },
                                  },
                                }"
                              >
                                <template #trailing>
                                  <span class="text-xs text-gray-500 dark:text-gray-400">aUEC</span>
                                </template>
                              </UInput>
                            </td>
                            <td class="relative text-left border-r last:border-0 border-btertiary">
                              <UButton variant="outline" @click="openSelectMember('income', income)">
                                {{
                                  income.member?.id
                                    ? income.member?.is_external
                                      ? income.member?.external_name
                                      : income.member?.user?.full_name
                                    : 'Kein Benutzer'
                                }}
                              </UButton>
                              <button
                                class="absolute top-0 bottom-0 right-0 my-auto transition-all opacity-50 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                                @click="removeIncome(income)"
                              >
                                <UIcon name="i-heroicons-x-mark" class="size-full" />
                              </button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                    <TableHr class="my-4" />
                    <div class="border divide-y rounded border-btertiary divide-btertiary">
                      <div class="relative py-2">
                        <p class="text-xl text-center">Ausgaben</p>
                        <button class="absolute top-0 bottom-0 my-auto right-2 size-8" @click="addExpense()">
                          <UIcon
                            name="i-heroicons-plus-small-solid"
                            class="opacity-50 size-full hover:opacity-100 animate-link hover:cursor-pointer"
                          />
                        </button>
                      </div>
                      <div class="p-1 overflow-y-scroll h-[324px]">
                        <table class="h-fit">
                          <tr>
                            <th class="text-left">Name</th>
                            <th class="text-left">Ausgabe</th>
                            <th class="text-left">Mitarbeiter</th>
                          </tr>
                          <tr v-for="expense in expenses" :key="expense.id" class="">
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UInput
                                v-model="expense.name"
                                placeholder="Name eingeben"
                                size="sm"
                                class="relative w-40"
                              />
                            </td>
                            <td class="text-left border-r last:border-0 border-btertiary">
                              <UInput
                                v-model="expense.value"
                                placeholder="Ausgabe eingeben"
                                size="sm"
                                class="relative w-40"
                                :ui="{
                                  trailing: {
                                    padding: {
                                      sm: 'pe-14',
                                    },
                                  },
                                }"
                              >
                                <template #trailing>
                                  <span class="text-xs text-gray-500 dark:text-gray-400">aUEC</span>
                                </template>
                              </UInput>
                            </td>
                            <td class="relative text-left border-r last:border-0 border-btertiary">
                              <UButton variant="outline" @click="openSelectMember('expense', expense)">
                                {{
                                  expense.member?.id
                                    ? expense.member?.is_external
                                      ? expense.member?.external_name
                                      : expense.member?.user?.full_name
                                    : 'Kein Benutzer'
                                }}
                              </UButton>
                              <button
                                class="absolute top-0 bottom-0 right-0 my-auto transition-all opacity-50 size-6 animate-link hover:cursor-pointer hover:opacity-100"
                                @click="removeExpense(expense)"
                              >
                                <UIcon name="i-heroicons-x-mark" class="size-full" />
                              </button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                    <TableHr class="my-4" />
                    <div>
                      <ButtonDefault
                        class="w-full"
                        :disabled="!options.manager?.user?.id"
                        @click="() => (options.manager?.user?.id ? calculate() : null)"
                        >Verteilung ausrechnen</ButtonDefault
                      >
                      <span v-if="!options.manager?.user?.id" class="text-xs italic text-danger/85">
                        Es muss ein Manager ausgewählt werden.
                      </span>
                    </div>
                  </div>
                </template>
              </UCard>
              <UCard class="col-span-1">
                <template #header>
                  <p class="p-0 text-2xl text-center">Verteilung</p>
                </template>
                <template #default>
                  <span class="float-right text-xs italic text-neutral-200/75">(abzgl. Gebühren)</span>
                  <table class="h-fit">
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Betrag</th>
                    </tr>
                    <tr v-for="(member, index) in steps.members" :key="index">
                      <td class="text-left border-r last:border-0 border-btertiary">
                        {{ member.member.is_external ? member.member.external_name : member.member.user.full_name }}
                      </td>
                      <td class="text-left border-r last:border-0 border-btertiary">
                        {{ member.value }} <span class="text-xs text-gray-500 dark:text-gray-400">aUEC</span>
                      </td>
                    </tr>
                  </table>
                </template>
                <template #footer>
                  <div class="flex flex-wrap justify-between gap-2">
                    <UButton
                      :color="steps.share ? 'primary' : 'gray'"
                      variant="outline"
                      disabled
                      @click="steps.share ? generatePdf() : null"
                      >Im A.M.S. speichern (soon)</UButton
                    >
                    <UButton
                      :color="steps.share ? 'industrial' : 'gray'"
                      variant="outline"
                      class="ml-auto"
                      :disabled="steps.share ? false : true"
                      @click="steps.share ? generatePdf() : null"
                      >Als PDF Exportieren</UButton
                    >
                  </div>
                </template>
              </UCard>
            </div>
          </template>
        </template>
      </TabGroup>
    </div>
  </NuxtLayout>
</template>
