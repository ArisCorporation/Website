<script setup lang="ts">
defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const modal = ref();
const open = () => {
  modal.value.openModal();
};
</script>

<template>
  <div class="mt-16">
    <TheModal
      ref="modal"
      hide-close-button
      hide-x-button
      :content-data="data.dcLink"
      content="HomeSectionRecruitmentModalContent"
    />
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
      <ButtonDefault color="secondary" type="button" class="p-2 mt-2" @click="open"> Jetzt bewerben </ButtonDefault>
    </div>
  </div>
</template>
