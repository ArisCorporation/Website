<script setup lang="ts">
const { $directus } = useNuxtApp()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref(null)

const login = async () => {
  try {
    errorMsg.value = null
    await $directus.login(email.value, password.value)
    router.push('/posts')
  } catch (error: any) {
    errorMsg.value = error.errors[0].message
  }
}

definePageMeta({
  middleware: async () => {
    const { $isAuthenticated, $directus } = useNuxtApp()

    if (await $isAuthenticated()) return navigateTo('/posts')
  },
})
</script>
<template>
  <form @submit.prevent="login">
    <h1>Login</h1>
    <div v-if="errorMsg">
      <p>{{ errorMsg }}</p>
    </div>
    <div>
      <input
        required
        type="email"
        v-model="email"
        name="email"
        placeholder="Email"
      />
    </div>
    <div>
      <input
        required
        type="password"
        v-model="password"
        name="password"
        placeholder="Password"
      />
    </div>
    <button type="submit">Login</button>
  </form>
</template>
