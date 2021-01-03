<template>
  <div
    class="absolute-positioning-pane"
    ref="root"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    :style="{ width: this.width + 'px', height: this.height + 'px' }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "./TContainer.vue";
import { Prop } from "vue-property-decorator";
import { getSizeFull } from "@/util/MeasurementUtils";

type DragInformation = {
  target: HTMLElement;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  currentX: number;
  currentY: number;
};

@Component({
  components: { TContainer }
})
export default class AbsolutePositioningPane extends Vue {
  private dragInformation: DragInformation | null = null;

  @Prop()
  private readonly width!: number;
  @Prop()
  private readonly height!: number;

  private mouseDown(e: MouseEvent | TouchEvent) {
    if (!e.target || !(e.target instanceof HTMLElement)) {
      return;
    }
    let target: HTMLElement | null = e.target;
    const isRoot = (elem: HTMLElement) =>
      elem.classList.contains("absolute-positioning-pane");

    while (target.parentElement && !isRoot(target.parentElement)) {
      target = target.parentElement;
    }

    if (!target || !target.classList.contains("absolute-movable")) {
      return;
    }

    e.preventDefault();

    document.documentElement.addEventListener("mouseup", this.mouseUp);
    document.documentElement.addEventListener("touchend", this.mouseUp);

    let offsetX: number;
    let offsetY: number;

    if (e instanceof MouseEvent) {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    } else {
      const rect = target.getBoundingClientRect();
      offsetX = e.targetTouches[0].clientX - rect.left;
      offsetY = e.targetTouches[0].clientY - rect.top;
    }

    this.dragInformation = {
      target: target,
      startX: offsetX,
      startY: offsetY,
      offsetX: offsetX,
      offsetY: offsetY,
      currentX: offsetX,
      currentY: offsetY
    };
  }

  private mouseUp() {
    if (this.dragInformation) {
      this.$emit("element-moved", {
        target: this.dragInformation.target,
        x: this.dragInformation.currentX,
        y: this.dragInformation.currentY
      });
    }
    this.dragInformation = null;
    document.documentElement.removeEventListener("mouseUp", this.mouseUp);
  }

  private mouseMove(e: MouseEvent | TouchEvent) {
    if (!this.dragInformation) {
      return;
    }
    e.preventDefault();

    const root = this.$refs["root"] as HTMLElement;
    const rootRect = root.getBoundingClientRect();
    let offsetX: number;
    let offsetY: number;

    if (e instanceof MouseEvent) {
      offsetX = e.clientX - rootRect.left;
      offsetY = e.clientY - rootRect.top;
    } else {
      offsetX = e.targetTouches[0].clientX - rootRect.left;
      offsetY = e.targetTouches[0].clientY - rootRect.top;
    }

    const deltaX = offsetX - this.dragInformation.startX;
    const deltaY = offsetY - this.dragInformation.startY;

    const clamp = (x: number, max: number) => {
      return Math.max(0, Math.min(x, max));
    };

    const targetSize = getSizeFull(this.dragInformation.target);
    const newX = clamp(
      this.dragInformation.startX + deltaX - this.dragInformation.offsetX,
      rootRect.width - targetSize.width
    );
    const newY = clamp(
      this.dragInformation.startY + deltaY - this.dragInformation.offsetY,
      rootRect.height - targetSize.height
    );

    this.dragInformation.target.style.left = newX + "px";
    this.dragInformation.target.style.top = newY + "px";

    this.dragInformation.currentX = newX;
    this.dragInformation.currentY = newY;
  }

  private mounted() {
    const elem = this.$refs["root"] as HTMLElement;
    elem.addEventListener("touchstart", this.mouseDown);
    elem.addEventListener("touchmove", this.mouseMove);
  }
}
</script>

<style scoped>
.absolute-positioning-pane {
  position: relative;
}
.absolute-positioning-pane > * {
  position: absolute;
}
</style>
