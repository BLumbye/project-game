<template>
  <template v-if="pageLoading">
    <p>Loading...</p>
  </template>
  <main v-else>
    <h1>Project Game</h1>
    <template v-if="isGameInProgress || adminLogin">
      <h2>Log In</h2>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-container">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            name="username"
            class="fancy-input"
            required
            placeholder="john@doe.com"
          />
        </div>
        <div class="input-container">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            class="fancy-input"
            required
            placeholder="1234"
          />
        </div>
        <span v-if="errorMessage !== null" class="error-message">{{ errorMessage }}</span>
        <input type="submit" value="Log in" :disabled="loginLoading" />
      </form>
    </template>
    <template v-if="!isGameInProgress">
      <h2>Freeplay mode</h2>
      <p>
        You are currently in freeplay mode. This means that you are not connected to a game server. You can still play
        the game, but your progress will not be saved.
      </p>
      <router-link class="button-link" to="/game">Start Game</router-link>
      <button v-if="!adminLogin" class="link-button admin-button" @click="adminLogin = true">Log in as admin</button>
    </template>
    <template v-if="devMode">
      <br />
      <button
        style="margin-top: 1rem"
        @click="
          () => {
            $router.push('/game');
          }
        "
      >
        Development Mode
      </button>
    </template>
  </main>
  <footer>
    <span>
      Version {{ version }}. Created by Benjamin Lumbye and Victor Rasmussen for 42429/42430 Project Management at DTU.
    </span>
  </footer>
</template>

<!-- Script -->

<script setup lang="ts">
import { ClientResponseError } from 'pocketbase';
import { collections, isAdmin, pocketbase } from '../pocketbase';

const router = useRouter();

const pageLoading = ref(true);
const loginLoading = ref(false);
const username = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const adminLogin = ref(false);
const isGameInProgress = ref(false);

const devMode = import.meta.env.MODE === 'development';
const version = import.meta.env.VITE_APP_VERSION as string;

function routeAway() {
  if (isAdmin()) {
    router.push('/admin');
  } else {
    router.push('/game');
  }
}

if (pocketbase.authStore.isValid) {
  console.log('redirecting from auth...');
  routeAway();
}

// Check if a game is in progress
collections.games
  .getFirstListItem('game_state != "finished"')
  .then(() => {
    isGameInProgress.value = true;
    pageLoading.value = false;
  })
  .catch(() => {
    isGameInProgress.value = false;
    pageLoading.value = false;
  });

const handleLogin = async () => {
  try {
    loginLoading.value = true;
    errorMessage.value = null;

    // Clear possible previous game data
    localStorage.clear();

    await collections.users.authWithPassword(username.value, password.value);

    // Ensures that the previous data is gone and triggers re-routing
    location.reload();
  } catch (error) {
    if (!(error instanceof ClientResponseError)) {
      errorMessage.value = 'An unknown error occurred. Please contact an administrator.';
      console.error('unknown error during login', error);
    } else {
      if (error.status === 400) {
        errorMessage.value = 'Invalid username or password.';
      } else {
        errorMessage.value = 'A server error occurred. Please contact an administrator.';
        console.error('server error during login', error);
      }
    }
  } finally {
    loginLoading.value = false;
  }
};
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
      font-size: 0.875rem;
    }
  }

  & input[type='submit'] {
    padding-inline: 1.5em;
  }
}

.button-link {
  display: block;
  margin-top: 1em;
  margin-inline: 5em;
}

.admin-button {
  margin-top: 1em;
  opacity: 0.9;
}

form + h2 {
  margin-top: 2em;
}

main {
  width: clamp(300px, 80%, 600px);
}
</style>

<style lang="postcss">
#app {
  display: flex;
  flex-direction: column;
  align-items: center;

  & main {
    flex: 1;
  }

  & footer {
    font-size: 0.875rem;
    font-weight: 300;
    opacity: 0.75;
  }
}
</style>

<route>
{
  name: "auth"
}
</route>
