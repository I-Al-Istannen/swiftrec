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

  private containerMouseDown(e: MouseEvent | TouchEvent) {
    this.setDraggingInfo(e);

    if (!this.draggingInfo) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    document.documentElement.addEventListener("mouseup", this.mouseUp);
    document.documentElement.addEventListener("touchend", this.mouseUp);
    document.documentElement.addEventListener("mousemove", this.mouseMove);
    document.documentElement.addEventListener("touchmove", this.mouseMove);
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
    document.documentElement.removeEventListener("touchend", this.mouseUp);
    document.documentElement.removeEventListener("mousemove", this.mouseMove);
    document.documentElement.removeEventListener("touchmove", this.mouseMove);

    this.$emit("resize", { width: newWidth, height: newHeight });
  }

  private mouseMove(e: MouseEvent | TouchEvent) {
    if (!this.draggingInfo) {
      return;
    }
    e.preventDefault();

    const clamp = (x: number, max: number | null) => {
      if (max === null) {
        max = Number.POSITIVE_INFINITY;
      }
      return Math.max(0, Math.min(x, max));
    };

    const { offsetX, offsetY } = this.offsetFromEvent(e, true);

    const deltaX = offsetX - this.draggingInfo.startX;
    const deltaY = offsetY - this.draggingInfo.startY;
    this.overlayWidth = clamp(
      this.draggingInfo.initialWidth + deltaX,
      this.maxWidth
    );
    this.overlayHeight = clamp(
      this.draggingInfo.initialHeight + deltaY,
      this.maxHeight
    );
  }

  private offsetFromEvent(e: MouseEvent | TouchEvent, absolute: boolean) {
    let offsetX: number;
    let offsetY: number;

    let rect: DOMRect;
    if (absolute) {
      const container = this.$refs["container"] as HTMLElement;
      rect = container.getBoundingClientRect();
    } else {
      const elem: HTMLElement = e.target as HTMLElement;
      rect = elem.getBoundingClientRect();
    }

    if (e instanceof MouseEvent) {
      offsetX = e.clientX - Math.floor(rect.left);
      offsetY = e.clientY - Math.floor(rect.top);
    } else {
      offsetX = e.targetTouches[0].clientX - Math.floor(rect.left);
      offsetY = e.targetTouches[0].clientY - Math.floor(rect.top);
    }
    return { offsetX: offsetX, offsetY: offsetY };
  }

  private setDraggingInfo(e: MouseEvent | TouchEvent) {
    const container = this.$refs["container"] as HTMLElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const diff = (a: number, b: number) => Math.abs(a - b);

    const { offsetX, offsetY } = this.offsetFromEvent(e, false);

    // Not in a corner
    if (
      diff(offsetY, height) > this.cornerThreshold ||
      diff(offsetX, width) > this.cornerThreshold
    ) {
      this.draggingInfo = null;
      return;
    }

    this.draggingInfo = {
      startX: offsetX,
      startY: offsetY,
      initialHeight: height,
      initialWidth: width
    };
  }

  private mounted() {
    const container = this.$refs["container"] as HTMLElement;
    container.addEventListener("touchstart", this.containerMouseDown);
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
