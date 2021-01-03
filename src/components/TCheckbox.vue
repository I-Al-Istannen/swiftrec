<template>
  <div class="d-inline-block" style="flex-direction: column;">
    <label :class="{ disabled: disabled }">
      <input
        :disabled="disabled"
        type="checkbox"
        :checked="checked"
        @click="onClick"
      />
      <span class="fake-box">
        <span></span>
      </span>
      <slot></slot>
    </label>
    <span class="text-error" v-if="errorMessage || validationResult">
      {{ errorMessage ? errorMessage : validationResult }}
    </span>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component";
import { Model, Prop, Watch } from "vue-property-decorator";
import ValidatableMixin from "@/mixins/ValidatableMixin.vue";

@Component
export default class TCheckbox extends mixins(ValidatableMixin) {
  @Model("checked", { default: true })
  private readonly checked!: boolean;

  @Prop({ default: () => [] })
  private readonly rules!: ((input: boolean) => string | null)[];

  @Prop({ default: false, type: Boolean })
  private readonly disabled!: boolean;

  @Prop({ default: null })
  private readonly errorMessage!: string | null;

  @Watch("checked")
  private updateValidator() {
    this.validator.validate();
  }

  validate(): boolean {
    return this.validationResult === null;
  }

  private get validationResult(): string | null {
    for (const rule of this.rules) {
      const result = rule(this.checked);
      if (result) {
        return result;
      }
    }

    return null;
  }

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
  justify-content: flex-start;
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

label.disabled {
  color: var(--color-text-dimmed);
}
input[type="checkbox"]:disabled + .fake-box {
  border: 2px solid var(--color-text-dimmed);
}
input[type="checkbox"]:checked:disabled + .fake-box > span {
  background-color: var(--color-text-dimmed);
}

.text-error {
  font-size: 13px;
}
</style>
