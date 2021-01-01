<template>
  <t-container fluid class="t-card">
    <t-row v-if="hasTitleSlot" class="card-title" no-gutters>
      <slot name="title"></slot>
    </t-row>
    <t-row class="card-text">
      <slot name="text"></slot>
    </t-row>
    <t-row v-if="hasActionsSlot" class="card-actions" no-gutters>
      <slot name="actions"></slot>
    </t-row>
  </t-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "./TContainer.vue";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";

@Component({
  components: {
    "t-col": TCol,
    "t-row": TRow,
    "t-container": TContainer
  }
})
export default class TCard extends Vue {
  private get hasTitleSlot() {
    return !!this.$slots.title;
  }
  private get hasActionsSlot() {
    return !!this.$slots.actions;
  }
}
</script>

<style scoped>
.t-card {
  background-color: var(--color-background);
}
</style>
