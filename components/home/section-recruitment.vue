<script setup lang="ts">
defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const modalStore = useModalStore();
</script>

<template>
  <div class="mt-16">
    <div>
      <h1>Wir suchen neue <span class="text-primary-400">Mitarbeiter</span></h1>
      <hr />
      <h2>Rekrutierung:</h2>
      <hr class="hr-short" />
    </div>
    <p>
      Falls du nun Interesse hast dich bei uns zu bewerben, dann kannst du das ganz einfach über unseren Discord machen.
    </p>
    <div class="w-full py-12 mt-8 text-center border-l border-l-secondary bg-black/40 px-9">
      <h3 class="text-secondary">Mitglied werden</h3>
      <p>Für weitere Informationen klicke einfach auf:</p>
      <ButtonDefault
        color="secondary"
        type="button"
        class="mt-2"
        @click="modalStore.openModal('', { hideCloseButton: true, hideXButton: true })"
      >
        Jetzt bewerben
      </ButtonDefault>
    </div>
    <TheModal padding>
      <template #content="{ close }">
        <div class="text-left">
          <div>
            <h3 class="text-secondary">Bewerben:</h3>
            <hr />
          </div>
          <div>
            <p>
              Du solltest folgende Anforderungen erfüllen. Auf unserem Discord kannst du dann eine aussagekräftige
              Bewerbung schreiben.
            </p>
            <h4 class="uppercase">Anforderungen:</h4>
            <ul>
              <li>Du solltest mindestens 21 Jahre alt sein.</li>
              <li>Du solltest natürlich Spaß am spielen und an gemeinschaftlichen Aktionen haben.</li>
              <li>
                Außerdem ist die ArisCorp eine friedlich Organisation. Also solltest du natürlich auch Spaß am
                friedlichen spielen haben, und dein Interesse sollte darin bestehen jegliche Situation ruhig zu klären
                und nicht direkt den Abzug zu betätigen.
              </li>
              <li>
                Discord ist unsere Hauptkommunikationsplattform also solltest du auch diese Software nutzen, wir sind
                täglich da und du kannst jederzeit einfach in einen Channel kommen um zu quatschen.
              </li>
            </ul>
          </div>
          <div>
            <h4 class="uppercase">Wie kann ich mich bewerben?</h4>
            <p>
              Aktuell kannst du dich auf unserem Discord bewerben. Es gibt einen Textkanal für Bewerbungen. Dort stehen
              alle nötigen Informationen und Anweisungen. Unser Rekrutierungsteam wird sich schnellstmöglich um dich
              kümmern!
            </p>
          </div>
          <hr />
          <div class="relative flex flex-wrap-reverse sm:flex-nowrap">
            <ButtonDefault class="w-full mt-4 sm:my-auto sm:w-fit h-fit" @click="close"> Schließen </ButtonDefault>
            <div class="flex justify-center mx-auto space-x-12">
              <NuxtLink class="my-auto transition rounded hover:bg-white" :to="data.dcLink" target="_blank">
                <NuxtImg src="90d5157b-2d6e-4ce2-af5a-9bf59343ec66" :placeholder="[16, 16, 1, 5]" width="125" />
              </NuxtLink>
              <NuxtLink
                class="my-auto transition rounded hover:bg-white"
                to="https://robertsspaceindustries.com/orgs/ARISCORP"
                target="_blank"
              >
                <NuxtImg src="74529b89-cf09-4b2d-bd65-5813097cd65b" :placeholder="[16, 16, 1, 5]" width="125" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>
    </TheModal>
  </div>
</template>
