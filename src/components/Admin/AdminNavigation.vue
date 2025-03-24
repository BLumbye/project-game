<template>
  <nav>
    <AdminNavigationLink
      v-for="route in routes"
      :key="route.path"
      :to="route.path"
      :disabled="route.disabled"
      :sub-routes="route.children"
      v-show="route.visible !== false"
    >
      {{ route.name }}
    </AdminNavigationLink>
  </nav>
</template>

<script setup lang="ts">
const adminStore = useAdminStore();

export interface Route {
  name: string;
  path: string;
  disabled?: boolean;
  visible?: boolean;
  children?: Route[];
}

const routes = computed<Route[]>(() => [
  {
    name: 'Home',
    path: '/admin',
  },
  {
    name: 'Games',
    path: '/admin/games',
    children: adminStore.games
      .sort((a, b) => b.game_id - a.game_id)
      .map((game) => ({
        name: `Game ${game.game_id}${game.game_state !== 'finished' ? ' (In progress)' : ''}`,
        path: `/admin/game/${game.game_id}`,
        children: [
          {
            name: 'Users',
            path: `/admin/game/${game.game_id}/users`,
          },
          {
            name: 'Bids',
            path: `/admin/game/${game.game_id}/bids`,
            disabled: game.game_state === 'adding_users',
          },
          {
            name: 'Survey answers',
            path: `/admin/game/${game.game_id}/survey`,
            disabled: game.game_state === 'adding_users',
          },
          {
            name: 'Game progress',
            path: `/admin/game/${game.game_id}/game-progress`,
            disabled: game.game_state !== 'in_progress',
            visible: game.game_state !== 'finished',
          },
          {
            name: 'Results',
            path: `/admin/game/${game.game_id}/results`,
            disabled: game.game_state !== 'finished',
          },
          {
            name: 'Presentation',
            path: `/admin/game/${game.game_id}/presentation`,
          },
        ],
      })),
  },
]);
</script>

<style scoped lang="postcss">
nav {
  display: flex;
  gap: 0.35rem;
  flex-direction: column;
  background-color: var(--boxed-background-color);
  height: 100%;
  min-width: 230px;
  text-align: left;
  padding: 0.5rem;
  border-top: 1px solid var(--background-color);
  font-size: 0.875rem;

  & :deep(.route-container) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    & .link-toggle-container {
      display: flex;
      align-items: center;
      gap: 0.125rem;

      & a,
      & span {
        flex-grow: 1;
      }

      & button {
        padding: 0;
        background: none;
        border: none;
        width: 29px;
        height: 100%;
        cursor: pointer;

        &:hover {
          background-color: var(--background-color);
        }

        & .lucide {
          transition: transform 0.1s ease-in-out;
        }

        &.expanded .lucide {
          transform: rotate(90deg);
        }
      }
    }

    & .sub-routes {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding-left: 0.25rem;
      margin-left: 0.6rem;
      border-left: 1px solid rgba(255 255 255 / 10%);
    }
  }

  & :deep(a),
  & :deep(span) {
    padding: 0.25rem 0.5rem;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 400;
    border-radius: 4px;
    transition: background-color 0.1s ease-in-out;

    &:hover:not(.router-link-disabled),
    &.router-link-exact-active {
      background-color: var(--background-color);
    }

    &.router-link-exact-active {
      font-weight: 500;
    }

    &.router-link-disabled {
      opacity: 0.2;
      cursor: default;
    }
  }
}
</style>
