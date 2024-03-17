<template>
  <h2 v-show="show" class="section-title">Project team</h2>
  <div v-show="show" class="question">
    <label class="prompt" for="project-type"> What type of project are you studying? </label>
    <select
      id="project-type"
      v-model="projectType"
      name="project-type"
      :class="{ 'input-error': projectTypeError }"
      @input="() => (projectTypeError = undefined)"
    >
      <option v-for="type in projectTypes" :key="type" :value="type">{{ type }}</option>
    </select>
    <span v-if="projectTypeError" class="error-message">{{ projectTypeError }}</span>
  </div>
  <div v-show="show" class="question">
    <p class="prompt" for="case-industry">In what industry does your case company (and project) mainly work?</p>
    <select
      id="case-industry"
      v-model="caseIndustry"
      name="case-industry"
      :class="{ 'input-error': caseIndustryError }"
      @input="() => (caseIndustryError = undefined)"
    >
      <option v-for="industry in caseIndustries" :key="industry" :value="industry">{{ industry }}</option>
    </select>
    <span v-if="caseIndustryError" class="error-message">{{ caseIndustryError }}</span>
  </div>
  <div v-show="show" class="question">
    <label class="prompt" for="location">
      Location: Where will you be playing the game (online / hybrid / in class)? If in class, which room?
    </label>
    <input
      id="location"
      v-model.trim="location"
      type="text"
      name="location"
      :class="{ 'input-error': locationError }"
      @input="() => (locationError = undefined)"
    />
    <span v-if="locationError" class="error-message">{{ locationError }}</span>
  </div>
</template>

<script setup lang="ts">
const projectTypes = [
  '1. Aerospace/Defense Projects',
  '2. Business & Organization Change Projects',
  '3. Communication Systems Projects',
  '4. Event Projects',
  '5. Facilities Projects (Buildings, infrastructure, transport, ...)',
  '6. Information Systems (Software) Projects',
  '7. International Development Projects',
  '8. Media & Entertainment Projects',
  '9. Product and Service Development Projects',
  '10. Research and Development Projects',
  '11. Healthcare Projects',
  '12. Other Projects',
] as const;

const caseIndustries = [
  'A. Agriculture, forestry and fishing',
  'B. Mining and quarrying',
  'C. Manufacturing (chemicals, pharmaceuticals, computer, electronic, machinery, equipment, motor vehicles, ...)',
  'D. Electricity, gas, steam and air conditioning supply',
  'E. Water supply; sewerage, waste management and remediation activities',
  'F. Construction ( Construction of buildings, Civil engineering, Specialized construction activities e.g. Electrical installation)',
  'G. Wholesale and retail trade',
  'H. Transportation and storage (Land, Water, Air transport, Warehousing, Logistics...)',
  'I. Accommodation and food service activities (e.g hotels and restaurents...)',
  'J. Information and communication (Publishing, media production, Telecommunications, Computer programming, consultancy ...)',
  'K. Financial and insurance activities (Banking, Trusts, Insurance, Pensions...)',
  'L. Real estate activities (own, leasing or selling properties)',
  'M. Professional, scientific and technical activities (Consultants within Legal, accounting, Management, Architecture and engineering, Research,...)',
  'N. Administrative and support service activities (Renting and leasing, Security and investigation activities, facilities management,...)',
  'O. Public administration and defence; compulsory social security (General public administration state, region, regulation, defence, community service...)',
  'P. Education (primary/secondary education, higher education...)',
  'Q. Human health and social work activities (Hospital, Residential care...)',
  'R. Arts, entertainment and recreation (Creative, arts entertainment, libraries, archives, museums, sports, cultural activities,...)',
  'S. Other service activities (professional membership organizations, employers membership organizations, trade unions, repair activities...)',
  'T. Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use',
  'U. Activities of extraterritorial organizations and bodies (international organisations like UN, EU...)',
] as const;

const projectType = ref<(typeof projectTypes)[number] | undefined>();
const caseIndustry = ref<(typeof caseIndustries)[number] | undefined>();
const location = ref<string | undefined>();

const projectTypeError = ref<string | undefined>();
const caseIndustryError = ref<string | undefined>();
const locationError = ref<string | undefined>();

defineProps<{
  show: boolean;
}>();

defineExpose({
  getData() {
    return {
      project_type: projectType.value,
      case_industry: caseIndustry.value,
      location: location.value,
    };
  },
  errorCheck() {
    let error = false;
    if (projectType.value === undefined) {
      projectTypeError.value = 'Please select a project type';
      error = true;
    }
    if (caseIndustry.value === undefined) {
      caseIndustryError.value = 'Please select a case industry';
      error = true;
    }
    if (location.value === undefined || location.value === '') {
      locationError.value = 'Please enter a location';
      error = true;
    }
    return error;
  },
});
</script>

<style scoped lang="postcss"></style>
