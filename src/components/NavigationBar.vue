<template>
  <t-row style="margin-top: 0">
    <t-col class="mr-6">
      <router-link :to="{ name: 'home' }" class="concealed-router-link">
        <em class="logo-text">SwiftRec</em>
      </router-link>
    </t-col>
    <t-col v-for="entry in navigationEntries" :key="entry.meta.title">
      <router-link :to="entry">{{ "[" + entry.meta.title + "]" }}</router-link>
    </t-col>
    <t-spacer></t-spacer>
  </t-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";
import { routes } from "@/router";
import TSpacer from "@/components/TSpacer.vue";
import TButton from "@/components/TButton.vue";

@Component({
  components: {
    "t-button": TButton,
    "t-spacer": TSpacer,
    "t-row": TRow,
    "t-col": TCol
  }
})
export default class NavigationBar extends Vue {
  private get navigationEntries() {
    return routes.filter(it => it.meta.navigable);
  }
}
</script>

<style scoped>
.logo-text {
  color: var(--color-primary);
  text-shadow: 0 0 5px var(--color-primary);
  font-weight: bold;
  font-size: 1.3rem;
}
</style>
