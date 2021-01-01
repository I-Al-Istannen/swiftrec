<template>
  <t-container fluid>
    <t-row no-gutters>
      <t-col cols="12">
        <t-text-field
          :placeholder="currentItem ? keyFunction(currentItem) : placeholder"
          v-model="text"
          @keydown="textFieldKeyDown"
          @focused="inputFocused = $event"
        ></t-text-field>
      </t-col>
    </t-row>
    <t-row no-gutters v-show="filteredItems && showDropdown">
      <t-list
        no-gutters
        :items="filteredItems"
        :selected-item="currentItem"
        clickable
        @click="
          currentItem = $event;
          acceptSuggestion();
        "
      ></t-list>
    </t-row>
  </t-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TTextField from "@/components/TTextField.vue";
import TContainer from "@/components/TContainer.vue";
import TCol from "@/components/TCol.vue";
import TRow from "@/components/TRow.vue";
import TList from "@/components/TList.vue";
import { Model, Prop, Watch } from "vue-property-decorator";

@Component({
  components: {
    "t-list": TList,
    "t-container": TContainer,
    "t-col": TCol,
    "t-row": TRow,
    "t-text-field": TTextField
  }
})
export default class TAutocomplete extends Vue {
  private text = "";
  private inputFocused = false;
  private showDropdown = false;
  private currentItem: unknown | null = null;

  @Model("input", { default: null })
  private selectedItem!: unknown | null;

  @Prop({ default: () => (a: unknown) => a })
  private readonly keyFunction!: (a: unknown) => string;

  @Prop({ default: () => [] })
  private readonly items!: unknown[];

  @Prop({ default: "Start Typing..." })
  private readonly placeholder!: string;

  private get filteredItems() {
    return this.items.filter(it =>
      this.keyFunction(it)
        .toLocaleLowerCase()
        .includes(this.text.toLocaleLowerCase())
    );
  }

  private textFieldKeyDown(e: KeyboardEvent) {
    const currentIndex = this.filteredItems.indexOf(this.currentItem);

    if (e.key === "ArrowUp") {
      this.currentItem = this.filteredItems[
        this.clampItemIndex(currentIndex - 1)
      ];
    } else if (e.key === "ArrowDown") {
      this.currentItem = this.filteredItems[
        this.clampItemIndex(currentIndex + 1)
      ];
    } else if (e.key === "Enter") {
      this.acceptSuggestion();
    }
  }

  @Watch("inputFocused")
  private onInputFocusChange() {
    if (!this.inputFocused) {
      setTimeout(() => (this.showDropdown = false), 100);
    } else {
      this.showDropdown = true;
    }
  }

  @Watch("text")
  private onTextChange() {
    this.showDropdown = true;
    if (!this.text) {
      this.currentItem = null;
    }
  }

  @Watch("selectedItem")
  private onSelectedItemChange() {
    this.text = this.keyFunction(this.selectedItem);
    Vue.nextTick(() => (this.showDropdown = false));
  }

  private acceptSuggestion() {
    if (this.currentItem === null) {
      return;
    }
    this.$emit("input", this.currentItem);
  }

  private clampItemIndex(newIndex: number) {
    const length = this.filteredItems.length;
    return Math.max(0, Math.min(length - 1, newIndex));
  }
}
</script>
