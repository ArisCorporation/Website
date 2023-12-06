<script setup>
const { data } = defineProps({
  data: {
    type: Array,
    required: true,
  },
});
</script>
<template>
  <div class="flex flex-wrap justify-center">
    <MemberCard v-for="member in data.value" :key="member" :data="member" />
  </div>
</template>
