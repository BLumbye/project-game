<template>
  <h1>Please log in :)</h1>
  <form @submit.prevent="handleLogin"
        class="login-form">
    <div class="input-container">
      <label for="email">Email</label>
      <input type="email"
             name="email"
             id="email"
             required
             placeholder="john@doe.com"
             v-model="email" />
    </div>
    <div class="input-container">
      <label for="password">Password</label>
      <input type="password"
             name="password"
             id="password"
             required
             placeholder="1234"
             v-model="password" />
    </div>
    <input type="submit"
           :value="loading ? 'loading' : (type === 'sign-up' ? 'Sign up' : 'Log in')"
           :disabled="loading">
    <span v-if="type === 'sign-up'">Already have an user? <button class="link-button"
              @click="type = 'log-in'">Log In instead.</button></span>
    <span v-else>Not registered yet? <button class="link-button"
              @click="type = 'sign-up'">Sign up instead.</button></span>
  </form>
</template>

<!-- Script -->

<script setup lang="ts">
import { supabase } from '../supabase';

const type = ref<'sign-up' | 'log-in'>('sign-up');
const loading = ref(false);
const email = ref("");
const password = ref("");

const router = useRouter();

const handleLogin = async () => {
  try {
    loading.value = true;
    let response;
    if (type.value === 'sign-up') {
      response = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
    } else {
      response = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
    }
    if (response.error) throw response.error;

    router.push({ name: 'game' });
  } catch (error) {
    console.error('error during log in', error);
  } finally {
    loading.value = false;
  }
}
</script>

<!-- Styling -->

<style scoped lang="postcss">
.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;

  .input-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    & label {
      font-size: .875rem;
    }

    & input {
      border-radius: 8px;
      border: 1px solid rgb(255 255 255 / 25%);
      padding: 0.75em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      transition: border-color 0.25s;

      &:hover {
        border-color: #646cff;
      }

      &:focus,
      &:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
      }

      @media (prefers-color-scheme: light) {
        border-color: rgb(0 0 0 / 15%);
        background-color: #f9f9f9;
      }
    }
  }

  & input[type="submit"] {
    padding-inline: 1.5em;
  }
}
</style>

<route>
{
  name: "auth"
}
</route>