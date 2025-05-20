<script setup lang="ts">
const { login } = useDirectusAuth()

const credentials = reactive({
  email: 'thomas.blakeney@ariscorp.de',
  password: 'CmdaplaG_3',
})
const error = ref(null)

async function attemptLogin() {
  console.log('first')
  const { email, password } = unref(credentials)
  error.value = null

  try {
    // Be careful when using the login function because you have to pass the email and password as separate arguments instead of an object.
    console.log('before')
    const res = await login(email, password)
    console.log('after')
    console.log(res)
  } catch (err) {
    console.log('error')
    error.value = err.message
  }
}

definePageMeta({
  layout: false,
  middleware: 'guest',
})
</script>
<template>
  <form>
    <h1>Login</h1>
    <div>
      <UInput
        required
        type="text"
        v-model="credentials.email"
        name="email"
        placeholder="Email"
      />
    </div>
    <div>
      <UInput
        required
        type="password"
        v-model="credentials.password"
        name="password"
        placeholder="Password"
      />
    </div>
    <button @click="attemptLogin" type="submit">Login</button>
    {{ error }}
  </form>
</template>
