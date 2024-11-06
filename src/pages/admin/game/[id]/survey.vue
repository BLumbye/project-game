<template>
  <h2>Survey Answers ({{ currentGameData.surveyAnswers.length }}/{{ currentGameData.users.length }})</h2>
  <p v-if="currentGameData.surveyAnswers.length === 0" class="no-submissions">No answers yet...</p>
  <SurveyTable v-else class="survey-table" />
</template>

<script setup lang="ts">
import { AdminData } from '~/hooks/adminData';

const currentGameData = inject<Ref<AdminData>>('currentGameData')!;
</script>

<style scoped lang="postcss">
.survey-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
