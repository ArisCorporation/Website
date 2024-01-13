<script setup lang="ts">
const { width, height } = useWindowSize();

definePageMeta({
  layout: false,
  middleware: [
    'auth',
    async function (to, from) {
      const { fetchUser, setUser } = useDirectusAuth();
      const user = transformUser(useDirectusUser().value);
      if (!user) {
        const user = await fetchUser();
        setUser(user.value);
      }
      if (user.position.permissionLevel < 4) {
        return navigateTo({
          path: '/ams',
        });
      }
    },
  ],
});

useHead({
  title: 'Administration',
});
</script>

<template>
  <div>
    <NuxtLayout name="ams">
      <div class="max-w-[calc(100vw_-_20rem)] mx-auto mb-4">
        <h1 class="text-center">Verwaltungsdashboard</h1>
        <UTabs
          :items="[{ label: 'Home' }, { label: 'Verwaltungsübersicht' }, { label: 'Benutzer' }, { label: 'Hangars' }]"
          :ui="{ list: { background: 'bg-bsecondary', marker: { background: 'bg-bprimary' } } }"
          :orientation="width > 1024 ? 'horizontal' : 'vertical'"
        >
          <template #item="{ item }">
            <div v-if="item.label === 'Home'">
              <h2>Home</h2>
            </div>
            <div v-else-if="item.label === 'Verwaltungsübersicht'">
              <h2>Verwaltungsübersicht</h2>
            </div>
            <div v-else-if="item.label === 'Benutzer'">
              <div>
                <AmsAdministrationUserTable />
              </div>
            </div>
            <div v-else-if="item.label === 'Hangars'">
              <h2>Hangars</h2>
            </div>
          </template>
        </UTabs>
      </div>
    </NuxtLayout>
  </div>
</template>
