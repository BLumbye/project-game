<template>
  <main>
    <h1>Project Game</h1>
    <template v-if="gameStore.synchronized || adminLogin">
      <h2>Log In</h2>
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
    <template v-if="!gameStore.synchronized">
      <h2>Freeplay mode</h2>
      <p>
        You are currently in freeplay mode. This means that you are not connected to a game server.
        You can still play the game, but your progress will not be saved.
      </p>
      <router-link class="button-link"
                   to="/game">Start Game</router-link>
      <button v-if="!adminLogin"
              class="link-button admin-button"
              @click="adminLogin = true">Log in as admin</button>
    </template>
    <template v-if="devMode">
      <button @click="() => {
        gameStore.synchronized = false;
        $router.push('/game');
      }">Development Mode</button>
    </template>
  </main>
  <footer>
    <span>
      Created by Benjamin Lumbye and Victor Rasmussen for 42429/42430 Project Management at DTU
    </span>
  </footer>
</template>

<!-- Script -->

<script setup lang="ts">
import { ClientResponseError } from 'pocketbase';
import { collections, pocketbase } from '../pocketbase';

const loading = ref(false);
const username = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);
const adminLogin = ref(false);

const devMode = import.meta.env.MODE === 'development';

const gameStore = useGameStore();

if (pocketbase.authStore.isValid) {
  console.log('redirecting from auth...');
  gameStore.connectAllDatabases();
  gameStore.routeCorrectly();
}

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;

    const user = await collections.users.authWithPassword(username.value, password.value);

    if (!user.record.admin && (user.record.game_id !== gameStore.gameID || !gameStore.synchronized)) {
      errorMessage.value = "This user cannot be used for the current game.";
      pocketbase.authStore.clear();
      return;
    }

    gameStore.connectAllDatabases();
    gameStore.routeCorrectly();
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

form+h2 {
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