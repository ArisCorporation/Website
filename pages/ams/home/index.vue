<script setup lang="ts">
const { logout } = useDirectusAuth();
const { push } = useRouter();

const handleLogout = () => {
  logout();
  push('/');
};

definePageMeta({
  path: '/ams',
  layout: 'ams',
  middleware: 'auth',
});
</script>

<template>
  <div>
    <span>ams index</span>
    <button @click="handleLogout">logout</button>
  </div>
</template>
