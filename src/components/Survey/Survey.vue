<!--
  Survey page 

  This is where players answer the pre-game survey, including their bids.
-->

<template>
  <template v-if="!answered">
    <form @submit.prevent="handleSubmit">
      <Section1 v-if="section === 1"
                ref="section1" />
      <Section2 v-else-if="section === 2"
                ref="section2" />
      <Section3 v-else-if="section === 3"
                ref="section3" />
      <div class="buttons">
        <button class="text-button"
                :disabled="section === 1"
                @click="section--">Back</button>
        <input type="submit"
               :value="section === 3 ? 'Submit' : 'Continue'" />
      </div>
    </form>
  </template>
  <template v-else>
    <p class="completed-message">Thank you! You have now completed the survey and can leave the page.</p>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
import { ClientResponseError } from 'pocketbase';
import Section1 from './Section1.vue';
import Section2 from './Section2.vue';
import Section3 from './Section3.vue';
import { collections, pocketbase } from '~/pocketbase';

const answered = ref(false);
const bidStore = useBidStore();
const gameStore = useGameStore();

const section = ref<1 | 2 | 3>(1);
const section1 = ref<typeof Section1 | undefined>();
const section2 = ref<typeof Section2 | undefined>();
const section3 = ref<typeof Section3 | undefined>();

const data = ref<Object[]>([]);

const handleSubmit = (evt: Event) => {
  const sectionComponent = [section1, section2, section3][section.value - 1].value;
  if (!sectionComponent || sectionComponent.errorCheck())
    return;

  if (section.value === 3) {
    submitSurvey();
  } else {
    data.value.push(sectionComponent.getData());
    section.value++;
  }
}

const submitSurvey = () => {
  collections.surveyAnswers.create({
    ...data.value[0],
    ...data.value[2],
    user: pocketbase.authStore.model!.id,
    game_id: gameStore.gameID
  });
  bidStore.createBid(data.value[1]);
  answered.value = true;
}

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
}

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

  &>>>.question {
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

  & input[type="submit"] {
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

.completed-message {
  font-size: 1.2rem;
}
</style>