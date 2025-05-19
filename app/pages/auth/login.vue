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
        router.push('/posts') // Redirect to /posts
    } catch (error) {
        errorMsg.value = error.message || 'An unexpected error occurred'
    }
}
</script>
<template>
    <form @submit.prevent="login">
        <h1>Login</h1>
        <div v-if="errorMsg">
            <p>{{ errorMsg }}</p>
        </div>
        <div>
            <UInput required type="text" v-model="email" name="email" placeholder="Email" />
        </div>
        <div>
            <UInput required type="password" v-model="password" name="password" placeholder="Password" />
        </div>
        <button type="submit">Login</button>
    </form>
</template>
