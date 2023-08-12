<template>
  <h2 class="section-title">Project Game confidence</h2>
  <div class="question">
    <label class="prompt"
           for="profit-confidence">
      How confident are you that your team will complete the project with your expected profit margin?
    </label>
    <v-slider :min="50"
              :max="100"
              :step="1"
              thumb-label="always"
              v-model="profitConfidence">
      <template v-slot:prepend>50%</template>
      <template v-slot:append>100%</template>
      <template v-slot:thumb-label="{ modelValue }">{{ modelValue }}%</template>
    </v-slider>
    <span class="error-message"
          v-if="profitConfidenceError">{{ profitConfidenceError }}</span>
  </div>
  <div class="question">
    <label class="prompt"
           for="time-confidence">
      How confident are you that your team will complete the project on time?
    </label>
    <v-slider :min="50"
              :max="100"
              :step="1"
              thumb-label="always"
              v-model="timeConfidence">
      <template v-slot:prepend>50%</template>
      <template v-slot:append>100%</template>
      <template v-slot:thumb-label="{ modelValue }">{{ modelValue }}%</template>
    </v-slider>
    <span class="error-message"
          v-if="timeConfidenceError">{{ timeConfidenceError }}</span>
  </div>
  <div class="question">
    <label class="prompt"
           for="top-performer-confidence">
      How confident are you that your team will be on the top 10% performers in the class? (50%: not really, only if the
      others are pretty bad to 100%: We are really good, and will manage the project very effectively!)
    </label>
    <v-slider :min="50"
              :max="100"
              :step="1"
              thumb-label="always"
              v-model="topPerformerConfidence">
      <template v-slot:prepend>50%</template>
      <template v-slot:append>100%</template>
      <template v-slot:thumb-label="{ modelValue }">{{ modelValue }}%</template>
    </v-slider>
    <span class="error-message"
          v-if="topPerformerConfidenceError">{{ topPerformerConfidenceError }}</span>
  </div>
  <div class="question">
    <p class="prompt"
       for="project-ability">
      I think our team will be pretty good at doing this project.
    </p>
    <div class="radios">
      <div v-for="likert in likertScale"
           :key="likert"
           class="radio">
        <input type="radio"
               :id="`project-ability-${likert}`"
               :value="likert"
               name="project-ability"
               :class="{ 'input-error': projectAbilityError }"
               v-model="projectAbility"
               @input="() => projectAbilityError = undefined" />
        <label :for="`project-ability-${likert}`">{{ likert }}</label>
      </div>
    </div>
    <span class="error-message"
          v-if="projectAbilityError">{{ projectAbilityError }}</span>
  </div>
  <div class="question">
    <p class="prompt"
       for="project-knowledge">
      I think our team knows how to do this project.
    </p>
    <div class="radios">
      <div v-for="likert in likertScale"
           :key="likert"
           class="radio">
        <input type="radio"
               :id="`project-knowledge-${likert}`"
               :value="likert"
               name="project-knowledge"
               :class="{ 'input-error': projectKnowledgeError }"
               v-model="projectKnowledge"
               @input="() => projectKnowledgeError = undefined" />
        <label :for="`project-knowledge-${likert}`">{{ likert }}</label>
      </div>
    </div>
    <span class="error-message"
          v-if="projectKnowledgeError">{{ projectKnowledgeError }}</span>
  </div>
  <div class="question">
    <p class="prompt"
       for="superior-knowledge">
      I think our team knows more about doing this project than most other teams.
    </p>
    <div class="radios">
      <div v-for="likert in likertScale"
           :key="likert"
           class="radio">
        <input type="radio"
               :id="`superior-knowledge-${likert}`"
               :value="likert"
               name="superior-knowledge"
               :class="{ 'input-error': superiorKnowledgeError }"
               v-model="superiorKnowledge"
               @input="() => superiorKnowledgeError = undefined" />
        <label :for="`superior-knowledge-${likert}`">{{ likert }}</label>
      </div>
    </div>
    <span class="error-message"
          v-if="superiorKnowledgeError">{{ superiorKnowledgeError }}</span>
  </div>
</template>

<script setup lang="ts">
const likertScale = [
  'Strongly agree',
  'Agree',
  'Neutral',
  'Disagree',
  'Strongly disagree',
]

const profitConfidence = ref<number | undefined>(75);
const timeConfidence = ref<number | undefined>(75);
const topPerformerConfidence = ref<number | undefined>(75);
const projectAbility = ref<typeof likertScale[number] | undefined>();
const projectKnowledge = ref<typeof likertScale[number] | undefined>();
const superiorKnowledge = ref<typeof likertScale[number] | undefined>();

const profitConfidenceError = ref<string | undefined>();
const timeConfidenceError = ref<string | undefined>();
const topPerformerConfidenceError = ref<string | undefined>();
const projectAbilityError = ref<string | undefined>();
const projectKnowledgeError = ref<string | undefined>();
const superiorKnowledgeError = ref<string | undefined>();

defineExpose({
  getData() {
    return {
      profit_confidence: profitConfidence.value,
      time_confidence: timeConfidence.value,
      top_performer_confidence: topPerformerConfidence.value,
      project_ability: projectAbility.value,
      project_knowledge: projectKnowledge.value,
      superior_knowledge: superiorKnowledge.value,
    }
  },
  errorCheck() {
    let error = false;
    if (!profitConfidence.value) {
      profitConfidenceError.value = 'Please select a value';
      error = true;
    }
    if (!timeConfidence.value) {
      timeConfidenceError.value = 'Please select a value';
      error = true;
    }
    if (!topPerformerConfidence.value) {
      topPerformerConfidenceError.value = 'Please select a value';
      error = true;
    }
    if (!projectAbility.value) {
      projectAbilityError.value = 'Please select a value';
      error = true;
    }
    if (!projectKnowledge.value) {
      projectKnowledgeError.value = 'Please select a value';
      error = true;
    }
    if (!superiorKnowledge.value) {
      superiorKnowledgeError.value = 'Please select a value';
      error = true;
    }
    return error;
  }
});
</script>

<style scoped lang="postcss">
.question:deep(.v-input__details) {
  display: none;
}
</style>