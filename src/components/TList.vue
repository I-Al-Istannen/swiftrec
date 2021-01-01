<template>
  <t-container fluid :no-gutters="noGutters">
    <t-row
      no-gutters
      v-for="item in items"
      :key="JSON.stringify(item)"
      :class="computedTileClass(item)"
      @click="$emit('click', item)"
    >
      <t-col cols="12">
        {{ item }}
      </t-col>
    </t-row>
  </t-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import TContainer from "@/components/TContainer.vue";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";

@Component({
  components: {
    "t-row": TRow,
    "t-col": TCol,
    "t-container": TContainer
  }
})
export default class TList extends Vue {
  @Prop({ default: () => [] })
  private readonly items!: unknown[];

  @Prop({ default: false, type: Boolean })
  private readonly clickable!: boolean;

  @Prop({ default: false, type: Boolean })
  private readonly noGutters!: boolean;

  @Prop({ default: null })
  private readonly selectedItem!: unknown | null;

  private get computedTileClass() {
    return (item: unknown) => ({
      "t-list-tile": true,
      clickable: this.clickable,
      selected: item === this.selectedItem
    });
  }
}
</script>

<style scoped>
.t-list-tile:hover,
.t-list-tile.selected {
  background-color: var(--color-background-highlight);
}
.t-list-tile.clickable {
  cursor: pointer;
}
</style>
