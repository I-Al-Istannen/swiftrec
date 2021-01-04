<template>
  <span>
    <slot name="activator" :on="activatorListener"></slot>
    <t-container
      fluid
      class="overlay overlay-part"
      v-if="visible"
      @click="overlayClicked"
    >
      <t-row
        class="overlay-part"
        :style="{ 'max-width': wrap ? undefined : width + 'px' }"
      >
        <t-col :cols="wrap ? 'wrap' : 12">
          <slot></slot>
        </t-col>
      </t-row>
    </t-container>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "@/components/TContainer.vue";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";
import { Model, Prop } from "vue-property-decorator";

@Component({
  components: {
    "t-container": TContainer,
    "t-row": TRow,
    "t-col": TCol
  }
})
export default class TDialog extends Vue {
  @Model("visible", { default: false, type: Boolean })
  private visible!: boolean;

  @Prop({ default: 500 })
  private width!: number;

  @Prop({ default: false, type: Boolean })
  private wrap!: boolean;

  private get activatorListener() {
    return {
      click: () => this.$emit("visible", true)
    };
  }

  private overlayClicked(e: Event) {
    if ((e.target as HTMLElement).classList.contains("overlay-part")) {
      this.$emit("visible", false);
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  z-index: 20;

  overflow: auto;

  background-color: rgba(0, 0, 0, 0.75);
}
</style>
