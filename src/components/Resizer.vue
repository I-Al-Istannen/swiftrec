<template>
  <div
    @mousedown="containerMouseDown"
    class="resizer"
    ref="container"
    :style="{
      width: this.resizerWidth,
      height: this.resizerHeight,
      'max-width':
        this.maxWidth !== null ? this.maxWidth + 2 + 'px' : undefined,
      'max-height':
        this.maxHeight !== null ? this.maxHeight + 2 + 'px' : undefined
    }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "./TContainer.vue";
import { Prop } from "vue-property-decorator";

type DraggingInfo = {
  initialWidth: number;
  initialHeight: number;
  startX: number;
  startY: number;
};

@Component({
  components: { TContainer }
})
export default class Resizer extends Vue {
  private draggingInfo: DraggingInfo | null = null;
  private overlayHeight: number | null = null;
  private overlayWidth: number | null = null;

  @Prop({ default: 50 })
  private readonly cornerThreshold!: number;

  @Prop({ default: null })
  private readonly width!: number | null;

  @Prop({ default: null })
  private readonly height!: number | null;

  @Prop({ default: null })
  private readonly maxWidth!: number | null;

  @Prop({ default: null })
  private readonly maxHeight!: number | null;

  private get resizerWidth() {
    if (this.overlayWidth !== null) {
      return this.overlayWidth + "px";
    }
    if (this.width !== null) {
      return this.width + "px";
    }
    return undefined;
  }

  private get resizerHeight() {
    if (this.overlayHeight !== null) {
      return this.overlayHeight + "px";
    }
    if (this.height !== null) {
      return this.height + "px";
    }
    return undefined;
  }

  private containerMouseDown(e: MouseEvent) {
    this.setDraggingInfo(e);

    if (!this.draggingInfo) {
      return;
    }

    e.stopPropagation();

    document.documentElement.addEventListener("mouseup", this.mouseUp);
    document.documentElement.addEventListener("mousemove", this.mouseMove);
  }

  private mouseUp() {
    const newWidth = this.overlayWidth;
    const newHeight = this.overlayHeight;
    if (this.draggingInfo) {
      this.overlayWidth = null;
      this.overlayHeight = null;
      this.draggingInfo = null;
    }
    document.documentElement.removeEventListener("mouseup", this.mouseUp);
    document.documentElement.removeEventListener("mousemove", this.mouseMove);

    this.$emit("resize", { width: newWidth, height: newHeight });
  }

  private mouseMove(e: MouseEvent) {
    if (!this.draggingInfo) {
      return;
    }
    const clamp = (x: number, max: number | null) => {
      if (max === null) {
        max = Number.POSITIVE_INFINITY;
      }
      return Math.max(0, Math.min(x, max));
    };

    const deltaX = e.offsetX - this.draggingInfo.startX;
    const deltaY = e.offsetY - this.draggingInfo.startY;
    this.overlayWidth = clamp(
      this.draggingInfo.initialWidth + deltaX,
      this.maxWidth
    );
    this.overlayHeight = clamp(
      this.draggingInfo.initialHeight + deltaY,
      this.maxHeight
    );
  }

  private setDraggingInfo(e: MouseEvent) {
    const container = this.$refs["container"] as HTMLElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const diff = (a: number, b: number) => Math.abs(a - b);

    // Not in a corner
    if (
      diff(e.offsetY, height) > this.cornerThreshold ||
      diff(e.offsetX, width) > this.cornerThreshold
    ) {
      this.draggingInfo = null;
      return;
    }

    this.draggingInfo = {
      startX: e.offsetX,
      startY: e.offsetY,
      initialHeight: height,
      initialWidth: width
    };
  }
}
</script>

<style scoped>
.resizer {
  overflow: hidden;
}
.resizer {
  position: relative;
  border: 2px solid var(--color-primary);
}

.resizer::after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  right: 0;
  border-style: solid;
  border-color: transparent var(--color-primary);
  border-width: 0 15px 15px 0;
  width: 0;
  height: 0;
  transform: rotate(90deg);
}
</style>
