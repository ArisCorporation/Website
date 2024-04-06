<script setup lang="ts">
defineProps({
  data: {
    type: null,
    required: true,
  },
});
</script>
<template>
  <div class="flex flex-wrap justify-center">
    <MemberCard v-for="member in data" :key="member.id" :data="member" />
  </div>
</template>
