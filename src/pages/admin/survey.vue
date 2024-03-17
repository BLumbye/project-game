<template>
  <h2>Survey Answers ({{ adminStore.surveyAnswers.length }}/{{ adminStore.users.length }})</h2>
  <p v-if="adminStore.surveyAnswers.length === 0" class="no-submissions">No answers yet...</p>
  <SurveyTable v-else class="survey-table" />
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
