<template>
  <h1>Please log in :)</h1>
  <form @submit.prevent="handleLogin"
        class="login-form">
    <div class="input-container">
      <label for="username">Username</label>
      <input type="text"
             name="username"
             id="username"
             required
             placeholder="john@doe.com"
             v-model="username" />
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
    <span v-if="errorMessage !== null"
          class="error-message">{{ errorMessage }}</span>
    <input type="submit"
           value="Log in"
           :disabled="loading">
  </form>
</template>

<!-- Script -->

<script setup lang="ts">
import { ClientResponseError } from 'pocketbase';
import { pocketbase } from '../pocketbase';

const loading = ref(false);
const username = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null)

const router = useRouter();

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;

    const response = await pocketbase.collection('users').authWithPassword(username.value, password.value);

    router.push({ name: 'game' });
  } catch (error) {
    if (!(error instanceof ClientResponseError)) {
      errorMessage.value = "An unknown error occurred. Please contact an administrator.";
      console.error('unknown error during login', error);
    } else {
      if (error.status === 400) {
        errorMessage.value = "Invalid username or password.";
      } else {
        errorMessage.value = "A server error occurred. Please contact an administrator.";
        console.error('server error during login', error);
      }
    }
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

  & .error-message {
    color: #ff6464;
  }
}
</style>

<route>
{
  name: "auth"
}
</route>