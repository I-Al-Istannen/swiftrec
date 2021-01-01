<template>
  <t-container fluid no-gutters>
    <slot></slot>
  </t-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Model, Provide } from "vue-property-decorator";
import { Validatable, Validator } from "@/mixins/ValidatableMixin.vue";
import TContainer from "@/components/TContainer.vue";

@Component({
  components: { TContainer }
})
export default class TForm extends Vue implements Validator {
  @Model("valid", { default: false, type: Boolean })
  private readonly valid!: boolean;

  private errorBag: Validatable[] = [];

  @Provide("validator")
  private get validator() {
    return this;
  }

  validate() {
    let valid = true;
    for (const input of this.errorBag) {
      if (!input.validate()) {
        valid = false;
        break;
      }
    }
    this.$emit("valid", valid);
  }

  register(input: Validatable) {
    this.errorBag.push(input);
  }

  unregister(input: Validatable) {
    this.errorBag = this.errorBag.filter(it => it !== input);
  }
}
</script>
