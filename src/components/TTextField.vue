<template>
  <t-container fluid no-gutter class="t-text-field-wrapper">
    <t-row class="t-text-field" no-gutters align-left>
      <t-col no-gutter cols="12">
        <label>
          <input
            type="text"
            :class="{ error: validationResult || errorHighlight }"
            :style="computedInputStyle"
            :placeholder="placeholder"
            :value="value"
            @focus="$emit('focused', true)"
            @blur="$emit('focused', false)"
            @input="$emit('change', $event.target.value)"
            @keydown="$emit('keydown', $event)"
          />
          <span>
            {{ label }}
          </span>
        </label>
      </t-col>
    </t-row>
    <t-row no-gutters align-left v-if="validationResult">
      <t-col style="padding: 0 0 0 1ch" class="error-display">
        {{ validationResult }}
      </t-col>
    </t-row>
  </t-container>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component";
import { Model, Prop, Watch } from "vue-property-decorator";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";
import TContainer from "@/components/TContainer.vue";
import ValidatableMixin from "@/mixins/ValidatableMixin.vue";

@Component({
  components: {
    "t-container": TContainer,
    "t-row": TRow,
    "t-col": TCol
  }
})
export default class TTextField extends mixins(ValidatableMixin) {
  @Prop({ default: "" })
  private readonly placeholder!: string;

  @Model("change", { default: "" })
  private readonly value!: string;

  @Prop({ default: "" })
  private readonly label!: string;

  @Prop({ default: () => [] })
  private readonly rules!: ((input: string) => string | null)[];

  @Prop({ default: false, type: Boolean })
  private readonly errorHighlight!: boolean;

  @Prop({ default: null })
  private readonly chars!: number | null;

  @Watch("value")
  private updateValidator() {
    this.validator.validate();
  }

  validate(): boolean {
    return this.validationResult === null;
  }

  private get validationResult(): string | null {
    for (const rule of this.rules) {
      const result = rule(this.value);
      if (result) {
        return result;
      }
    }

    return null;
  }

  private get computedInputStyle() {
    return {
      width: this.chars ? `${this.chars + 2}ch` : undefined,
      "max-width": this.chars ? `${this.chars + 2}ch` : undefined
    };
  }
}
</script>

<style scoped>
.t-text-field-wrapper .t-row,
.t-text-field-wrapper .t-container {
  display: inline-flex;
}
.t-text-field-wrapper .t-col {
  display: inline;
}

.t-text-field,
.t-text-field input {
  flex: 1 1 10ch;
  min-width: 5ch;
}
.t-text-field input {
  padding: 0;
  margin: 0;
}
.t-text-field label {
  display: inline-flex;
  flex-wrap: wrap;
  width: 100%;
}
.t-text-field label > span {
  flex-shrink: 0;
}

input[type="text"] {
  padding: 0 0.5ch;
  margin: 0 0.5ch;
  background-color: transparent;
  border: 1px solid var(--color-background-dimmed);
  color: var(--color-text);
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  outline: none;
}
input[type="text"]:focus {
  border-color: var(--color-accent);
  outline: none;
}
input[type="text"].error {
  border-color: var(--color-warning-dimmed);
}
input[type="text"]:focus.error {
  border-color: var(--color-warning);
}

.error-display {
  color: var(--color-warning);
  font-size: 12px;
  overflow: hidden;
  word-wrap: break-word;
}
</style>
