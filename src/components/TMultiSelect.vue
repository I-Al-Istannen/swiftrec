<template>
  <t-container fluid no-gutters>
    <t-row align-left style="margin-top: 0; margin-bottom: 0">
      <t-col
        v-for="selected in selectedItems"
        :key="keyFunction(selected)"
        class="height-column"
      >
        <slot name="selected-display" :item="selected">
          <em>{{ keyFunction(selected) }}</em>
          <t-button @click="deleteItem(selected)">
            [x]
          </t-button>
        </slot>
      </t-col>
      <t-col
        :cols="12"
        :sm="selectedItems.length === 0 ? 12 : 5"
        :md="selectedItems.length === 0 ? 12 : 4"
        style="padding-left: 0"
      >
        <t-row>
          <t-text-field
            :placeholder="placeholder"
            v-model="currentNewText"
            @keydown="fieldKeyDown"
            @focused="inputFocused = $event"
            :error-highlight="!!validationResult"
          ></t-text-field>
        </t-row>
        <t-row no-gutters v-if="showDropdown">
          <t-list
            no-gutters
            :items="filteredItems"
            :selected-item="dropdownSelectedItem"
            clickable
            @click="
              currentNewText = keyFunction($event);
              acceptSuggestion();
            "
          ></t-list>
          <t-col
            cols="12"
            style="background-color: var(--color-background-highlight)"
            v-if="filteredItems.length === 0 && ownEntryCreation"
          >
            Create <em>{{ currentNewText }}</em>
          </t-col>
        </t-row>
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
import TContainer from "@/components/TContainer.vue";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";
import TList from "@/components/TList.vue";
import TTextField from "@/components/TTextField.vue";
import TButton from "@/components/TButton.vue";
import ValidatableMixin from "@/mixins/ValidatableMixin.vue";

@Component({
  components: {
    "t-button": TButton,
    "t-text-field": TTextField,
    "t-container": TContainer,
    "t-row": TRow,
    "t-col": TCol,
    "t-list": TList
  }
})
export default class TMultiSelect extends mixins(ValidatableMixin) {
  private currentNewText = "";
  private dropdownSelectedItem: unknown | null = null;
  private inputFocused = false;
  private showDropdown = false;

  @Prop({ default: () => [] })
  private readonly items!: unknown[];

  @Model("input", { default: () => [] })
  private readonly selectedItems!: unknown[];

  @Prop({ default: () => (a: unknown) => a })
  private readonly keyFunction!: (a: unknown) => string;

  @Prop({ default: "..." })
  private readonly placeholder!: string;

  @Prop({ default: null })
  private readonly ownEntryCreation!: (text: string) => unknown | null;

  @Prop({ default: () => [] })
  private readonly rules!: ((input: unknown[]) => string | null)[];

  @Prop({ default: null })
  private readonly filter!: (item: unknown, search: string) => boolean | null;

  @Watch("currentNewText")
  private onTextChange() {
    if (!this.currentNewText) {
      this.dropdownSelectedItem = null;
    }
    this.showDropdown = true;
  }

  @Watch("inputFocused")
  private onInputFocusChange() {
    if (!this.inputFocused) {
      setTimeout(() => (this.showDropdown = false), 100);
    } else {
      this.showDropdown = true;
    }
  }

  @Watch("selectedItems")
  private updateValidator() {
    this.validator.validate();
  }

  private get breakpoint() {
    return this.$breakpoints.currentBreakpoint;
  }

  private get filteredItems(): unknown[] {
    const defaultFilter = (item: unknown, search: string) =>
      this.keyFunction(item)
        .toLocaleLowerCase()
        .includes(search);

    const filter = this.filter || defaultFilter;
    const searchText = this.currentNewText.toLocaleLowerCase();

    return this.items
      .filter(it => filter(it, searchText))
      .filter(it => !this.selectedItems.includes(it));
  }

  private get validationResult(): string | null {
    for (const rule of this.rules) {
      const result = rule(this.selectedItems);
      if (result) {
        return result;
      }
    }

    return null;
  }

  private deleteItem(item: unknown) {
    this.$emit(
      "input",
      this.selectedItems.filter(it => it !== item)
    );
  }

  private addItem(item: unknown) {
    if (this.selectedItems.includes(item)) {
      return;
    }
    this.$emit("input", this.selectedItems.slice().concat(item));
  }

  private acceptSuggestion() {
    let newItem = this.filteredItems.find(
      it => this.keyFunction(it) === this.currentNewText
    );

    if (this.ownEntryCreation && !newItem) {
      newItem = this.ownEntryCreation(this.currentNewText);
    }

    if (newItem) {
      this.addItem(newItem);
      this.currentNewText = "";
      this.dropdownSelectedItem = null;
      this.showDropdown = false;
    }
  }

  private fieldKeyDown(e: KeyboardEvent) {
    const dropdownIndex = this.filteredItems.indexOf(this.dropdownSelectedItem);

    if (e.key === "Backspace" && !this.currentNewText && this.selectedItems) {
      this.deleteItem(this.selectedItems[this.selectedItems.length - 1]);
    } else if (e.key === "Enter") {
      if (this.dropdownSelectedItem !== null) {
        this.currentNewText = this.keyFunction(this.dropdownSelectedItem);
      }

      this.acceptSuggestion();
    } else if (e.key === "ArrowUp") {
      this.showDropdown = true;

      this.dropdownSelectedItem = this.filteredItems[
        this.clampItemIndex(dropdownIndex - 1)
      ];
    } else if (e.key === "ArrowDown") {
      this.showDropdown = true;

      this.dropdownSelectedItem = this.filteredItems[
        this.clampItemIndex(dropdownIndex + 1)
      ];
    } else if (e.key === "Escape") {
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      this.currentNewText = "";
    }
  }

  private clampItemIndex(newIndex: number) {
    const length = this.filteredItems.length;
    return Math.max(0, Math.min(length - 1, newIndex));
  }

  validate(): boolean {
    return this.validationResult === null;
  }
}
</script>

<style scoped>
.height-column {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-display {
  color: var(--color-warning);
  font-size: 12px;
  overflow: hidden;
  word-wrap: break-word;
}
</style>
