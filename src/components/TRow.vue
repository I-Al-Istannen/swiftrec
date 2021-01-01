<template>
  <div :class="computedClass" @click="$emit('click', $event)">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component
export default class TRow extends Vue {
  @Prop({ default: false, type: Boolean })
  private readonly noGutters!: boolean;

  @Prop({ default: false, type: Boolean })
  private readonly alignLeft!: boolean;

  private get computedClass() {
    return {
      "no-gutters": this.noGutters,
      "t-row": true,
      "align-left": this.alignLeft
    };
  }
}
</script>

<style scoped>
.t-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  margin: 0.5ch 0;
  width: 100%;
}
.t-row.align-left {
  justify-content: start;
  align-items: start;
}
.t-row.no-gutters {
  margin: 0;
}
.t-row.no-gutters > .t-col {
  padding-left: 0;
  padding-right: 0;
}
</style>
