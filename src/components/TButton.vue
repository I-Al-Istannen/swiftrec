<template>
  <button
    @click="$emit('click', $event)"
    :disabled="disabled"
    :title="myTitle"
    :style="styleBinding"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component
export default class TButton extends Vue {
  @Prop({ default: false })
  private readonly disabled!: boolean;

  @Prop({ default: "" })
  private readonly title!: string;

  @Prop({ default: null })
  private readonly color!: string | null;

  private get myTitle() {
    if (this.title) {
      return this.title;
    }
    if (this.disabled) {
      return "Button disabled";
    }
    return "";
  }

  private get styleBinding() {
    if (this.color === null) {
      return {};
    }
    return {
      color: `var(--color-${this.color})`
    };
  }
}
</script>

<style>
button {
  border: 0;
  padding: 0;
  margin: 0;
  background-color: transparent;
  color: var(--color-primary);
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
}
button:hover {
  color: var(--color-accent);
}
button:disabled {
  color: var(--color-text-dimmed);
  pointer-events: auto;
}
</style>
