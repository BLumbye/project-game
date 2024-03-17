<!--
  Survey page 

  This is where players answer the pre-game survey, including their bids.
-->

<template>
  <template v-if="!answered">
    <form @submit.prevent="handleSubmit">
      <template v-for="(SectionComponent, i) in activeSections" :key="i">
        <component :is="SectionComponent" ref="sectionRefs" :show="currentSection === i" />
      </template>
      <div class="buttons">
        <button class="text-button" :disabled="currentSection === 0" @click="currentSection--">Back</button>
        <input type="submit" :value="currentSection === activeSections.length - 1 ? 'Submit' : 'Continue'" />
      </div>
    </form>
  </template>
  <template v-else>
    <h2 class="completed-message">Thank you! You have now completed the survey. Wait for the game to start.</h2>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
import { ClientResponseError } from 'pocketbase';
// import Section1 from './Section1.vue';
import Section2 from './Section2.vue';
import Section3 from './Section3.vue';
import { collections, pocketbase } from '~/pocketbase';

const activeSections = [Section2, Section3];
const sectionRefs = ref<InstanceType<(typeof activeSections)[number]>[]>([]);
const currentSection = ref<number>(0);

const answered = ref(false);
const bidStore = useBidStore();
const gameStore = useGameStore();

// Progress to the next section or submit the survey
const handleSubmit = () => {
  const currentSectionComponent = sectionRefs.value[currentSection.value];
  if (!currentSectionComponent || currentSectionComponent.errorCheck()) return;

  if (currentSection.value === activeSections.length - 1) {
    submitSurvey();
  } else {
    currentSection.value++;
  }
};

// Submit the survey
const submitSurvey = () => {
  collections.surveyAnswers.create({
    ...sectionRefs.value.reduce((acc, section) => ({ ...acc, ...section.getData() }), {}),
    user: pocketbase.authStore.model!.id,
    game_id: gameStore.gameID,
  });
  bidStore.createBid(sectionRefs.value[0].getData()); // This needs to be manually changed to always reference section 2 (bid section)
  answered.value = true;
};

// Check if already submitted
const checkAnswered = async () => {
  try {
    await collections.surveyAnswers.getFirstListItem(`user.username="${pocketbase.authStore.model!.username}"`);
    answered.value = true;
  } catch (error) {
    if (!(error instanceof ClientResponseError) || error.status !== 404) {
      throw error;
    }
  }
};

//Give a warning notification if the user tries to leave the page without submitting the form
window.addEventListener('beforeunload', function (e) {
  // Check the form has been answered (submitted)
  if (!answered.value) {
    // Cancel the event and alert that
    // there are unsaved changes
    e.preventDefault();
    e.returnValue = '';
  }
});

checkAnswered();
</script>

<!-- Styling -->

<style scoped lang="postcss">
form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: clamp(250px, 80%, 768px);
  gap: 1rem;

  &:deep(.question) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
    background-color: var(--boxed-background-color);
    padding: 1.5em;
    border-radius: 4px;

    & .prompt {
      font-size: 1.1rem;
    }

    & input,
    & select {
      border-radius: 8px;
      padding: 0.75em;
      font-size: 1rem;
      font-weight: 500;
      font-family: inherit;

      &:focus,
      &:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
      }
    }

    & .radios {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      & .radio {
        display: flex;
        gap: 0.5rem;
      }
    }

    & .v-slider {
      margin-top: 1.5rem;
    }
  }

  & input[type='submit'] {
    align-self: flex-end;
  }

  & .buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

h2,
form,
.completed-message {
  padding-block: 2rem;
}
</style>
