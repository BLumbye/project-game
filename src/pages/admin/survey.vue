<template>
  <h2>Survey Answers ({{ adminStore.surveyAnswers.length }}/{{ adminStore.users.length }})</h2>
  <p class="no-submissions"
     v-if="adminStore.surveyAnswers.length === 0">No answers yet...</p>
  <SurveyTable class="survey-table"
               v-else />
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.survey-table,
.no-submissions {
  margin-top: 1rem;
}
</style>