<template>
  <table>
    <tbody>
      <tr class="month-row">
        <th>{{ capitalize(currentGame.config.durationIdentifier.singular) }}</th>
        <td v-for="i in duration + 1" :key="i" :class="{ 'is-current': i === currentTime + 1 }">
          {{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${i - 1}` }}
        </td>
      </tr>
      <tr class="submit-row">
        <th>Submit</th>
        <td v-for="i in duration" :key="i" :class="{ 'is-current': i === currentTime + 1 }">
          {{ `DF ${i}` }}
        </td>
        <td :class="{ 'is-current': currentTime === duration }"></td>
      </tr>
      <tr class="receive-row">
        <th>Receive</th>
        <td :class="{ 'is-current': currentTime === 0 }"></td>
        <td :class="{ 'is-current': currentTime === 1 }"></td>
        <td v-for="i in duration - 1" :key="i" :class="{ 'is-current': i === currentTime - 1 }">
          {{ `WR ${i}` }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';
import { capitalize } from '~/utils/formatters';
defineProps<{
  duration: number;
  currentTime: number;
}>();

const currentGame = inject<Ref<Games>>('currentGame')!;
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.5rem;

  td,
  th {
    padding-block: 0.25rem;
    padding-inline: 0.5rem;

    &:first-child {
      padding-left: 1rem;
    }

    &:last-child {
      padding-right: 1rem;
    }
  }

  tr {
    td:nth-child(odd),
    th:nth-child(odd) {
      background-color: var(--boxed-background-color);
    }
  }

  tr {
    border-bottom: 1px solid color-mix(in srgb, var(--text-color) 50%, transparent);

    td.is-current {
      background-color: #b3eb8683;
    }
  }
}

.month-row {
  font-weight: bold;

  td,
  th {
    padding-top: 1rem;
  }

  td {
    text-align: center;
  }
}

.submit-row td {
  text-align: right;
}

.receive-row td {
  text-align: left;
}
</style>
