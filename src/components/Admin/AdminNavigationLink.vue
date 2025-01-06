<template>
  <component
    :is="disabled ? 'span' : 'router-link'"
    :to="to"
    :class="{ 'router-link-disabled': disabled }"
    v-if="!subRoutes"
  >
    <slot />
  </component>
  <div class="route-container" :class="{ expanded: expanded }" v-else>
    <div class="link-toggle-container">
      <component :is="disabled ? 'span' : 'router-link'" :to="to" :class="{ 'router-link-disabled': disabled }">
        <slot />
      </component>
      <button :class="{ expanded: expanded }" @click="expanded = !expanded">
        <ChevronRight :size="20" />
      </button>
    </div>
    <div class="sub-routes" v-show="expanded">
      <AdminNavigationLink
        v-for="route in subRoutes"
        :key="route.path"
        :to="route.path"
        :disabled="route.disabled"
        :sub-routes="route.children"
        v-show="route.visible !== false"
      >
        {{ route.name }}
      </AdminNavigationLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Route } from './AdminNavigation.vue';
import { ChevronRight } from 'lucide-vue-next';

const router = useRouter();

const props = defineProps<{
  to: string;
  disabled?: boolean;
  subRoutes?: Route[];
}>();

function subRouteMatch(routes: Route[], path: string) {
  for (const route of routes) {
    if (route.path === path) return true;
    if (route.children && subRouteMatch(route.children, path)) return true;
  }
  return false;
}

const isActive = computed(() => {
  return (
    props.to === router.currentRoute.value.path ||
    (props.subRoutes !== undefined && subRouteMatch(props.subRoutes, router.currentRoute.value.path))
  );
});

watch(
  () => [props.subRoutes, isActive.value],
  () => {
    if (!expanded.value) expanded.value = isActive.value;
  },
);

const expanded = ref(isActive.value);
</script>
