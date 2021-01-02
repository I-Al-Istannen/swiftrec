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
export default class TContainer extends Vue {
  @Prop({ default: false, type: Boolean })
  private readonly fluid!: boolean;

  @Prop({ default: false, type: Boolean })
  private readonly noGutter!: boolean;

  @Prop({ default: false, type: Boolean })
  private readonly wrap!: boolean;

  private get computedClass() {
    return {
      fluid: this.fluid,
      "t-container": true,
      "no-gutters": this.noGutter,
      wrap: this.wrap
    };
  }
}
</script>

<style scoped>
.t-container {
  max-width: 1024px;
  margin: auto;

  padding: 1ch;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.t-container.wrap {
  width: max-content;
  max-width: 100%;
}
.t-container.fluid {
  max-width: 100%;
  width: 100%;
}
.t-container.no-gutters {
  margin: 0;
  padding: 0;
}
</style>
