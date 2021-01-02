<template>
  <label>
    <input type="checkbox" :checked="checked" @click="onClick" />
    <span class="fake-box">
      <span></span>
    </span>
    <slot></slot>
  </label>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Model } from "vue-property-decorator";

@Component
export default class TCheckbox extends Vue {
  @Model("checked", { default: true })
  private readonly checked!: boolean;

  private onClick(e: MouseEvent) {
    const target = e.target as HTMLInputElement;

    this.$emit("checked", target.checked);
  }
}
</script>

<style scoped>
label {
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
input[type="checkbox"] {
  display: none;
}
.fake-box > span {
  width: 60%;
  height: 60%;
  background-color: transparent;
}
.fake-box {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 1ch;
  width: 2ch;
  height: 2ch;
  border: 2px solid var(--color-primary);
}
input[type="checkbox"]:checked + .fake-box > span {
  background-color: var(--color-accent);
}
</style>
