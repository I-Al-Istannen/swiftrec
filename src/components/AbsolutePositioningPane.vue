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

type DragInformation = {
  target: HTMLElement;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
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

  private mouseDown(e: MouseEvent) {
    if (!e.target || !(e.target instanceof HTMLElement)) {
      return;
    }
    let target: HTMLElement | null = e.target;
    const isRoot = (elem: HTMLElement) =>
      elem.classList.contains("absolute-positioning-pane");

    while (target.parentElement && !isRoot(target.parentElement)) {
      target = target.parentElement;
    }

    if (!target) {
      return;
    }

    document.documentElement.addEventListener("mouseup", this.mouseUp);

    this.dragInformation = {
      target: target,
      startX: e.offsetX,
      startY: e.offsetY,
      offsetX: e.offsetX,
      offsetY: e.offsetY
    };
  }

  private mouseUp() {
    this.dragInformation = null;
    document.documentElement.removeEventListener("mouseUp", this.mouseUp);
  }

  private mouseMove(e: MouseEvent) {
    if (!this.dragInformation) {
      return;
    }

    const root = this.$refs["root"] as HTMLElement;
    let offsetX = e.offsetX;
    let offsetY = e.offsetY;

    let current = e.target as HTMLElement;
    while (current !== root) {
      offsetX += current.offsetLeft;
      offsetY += current.offsetTop;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      current = current.parentElement!;
    }

    const deltaX = offsetX - this.dragInformation.startX;
    const deltaY = offsetY - this.dragInformation.startY;

    const clamp = (x: number, max: number) => {
      return Math.max(0, Math.min(x, max));
    };

    const newX = clamp(
      this.dragInformation.startX + deltaX - this.dragInformation.offsetX,
      root.getBoundingClientRect().width -
        this.dragInformation.target.getBoundingClientRect().width
    );
    const newY = clamp(
      this.dragInformation.startY + deltaY - this.dragInformation.offsetY,
      root.getBoundingClientRect().height -
        this.dragInformation.target.getBoundingClientRect().height
    );

    this.dragInformation.target.style.left = newX + "px";
    this.dragInformation.target.style.top = newY + "px";
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
