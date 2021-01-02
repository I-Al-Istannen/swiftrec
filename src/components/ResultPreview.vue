<template>
  <absolute-positioning-pane
    style="border: 2px solid var(--color-warning)"
    :width="screenshareSize.width"
    :height="screenshareSize.height"
    @element-moved="elementMoved"
  >
    <resizer
      class="absolute-resizer absolute-movable"
      style="z-index: 10"
      :width="effectiveWebcamPosition.width"
      :height="effectiveWebcamPosition.height"
      :max-height="webcamStreamSize.height"
      :max-width="webcamStreamSize.width"
      @resize="webcamResized"
    >
      <media-stream-display :stream="webcamStream"></media-stream-display>
    </resizer>
    <media-stream-display :stream="screenshareStream"></media-stream-display>
  </absolute-positioning-pane>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MediaStreamDisplay from "@/components/MediaStreamDisplay.vue";
import Resizer from "@/components/Resizer.vue";
import AbsolutePositioningPane from "@/components/AbsolutePositioningPane.vue";
import { ElementPosition, StreamSize } from "@/store/Types";
import { Model, Prop } from "vue-property-decorator";
import { streamDimensions } from "@/util/MediaUtil";

@Component({
  components: { AbsolutePositioningPane, Resizer, MediaStreamDisplay }
})
export default class ResultPreview extends Vue {
  @Prop()
  private readonly screenshareSize!: StreamSize;
  @Prop()
  private readonly screenshareStream!: MediaStream;

  @Model("webcam-position")
  private readonly webcamPosition!: ElementPosition | null;
  @Prop()
  private readonly webcamStream!: MediaStream | null;

  private get webcamStreamSize() {
    // We have no webcam, so just say it is 0 pixels large
    if (!this.webcamStream) {
      return { width: 0, height: 0 };
    }
    return streamDimensions(this.webcamStream);
  }

  private get effectiveWebcamPosition() {
    if (this.webcamPosition) {
      return this.transformToLocal(this.webcamPosition);
    }
    return this.transformToLocal({
      x: 0,
      y: 0,
      ...this.webcamStreamSize
    });
  }

  private webcamResized(newSize: StreamSize) {
    const newPosition: ElementPosition = {
      x: this.effectiveWebcamPosition.x,
      y: this.effectiveWebcamPosition.y,
      ...newSize
    };
    this.$emit("webcam-position", this.transformToGlobal(newPosition));
  }

  private elementMoved(elem: { target: HTMLElement; x: number; y: number }) {
    if (!elem.target.classList.contains("absolute-resizer")) {
      return;
    }
    this.$emit("webcam-position", {
      width: this.effectiveWebcamPosition.width * this.previewWidthRatio,
      height: this.effectiveWebcamPosition.height * this.previewHeightRatio,
      x: elem.x * this.previewWidthRatio,
      y: elem.y * this.previewHeightRatio
    } as ElementPosition);
  }

  private created() {
    this.$emit("webcam-position", this.effectiveWebcamPosition);
  }

  // <!--<editor-fold desc="Coordinate transformation">-->
  private transformToLocal(global: ElementPosition): ElementPosition {
    return {
      x: global.x * (1 / this.previewWidthRatio),
      y: global.y * (1 / this.previewHeightRatio),
      width: global.width * (1 / this.previewWidthRatio),
      height: global.height * (1 / this.previewHeightRatio)
    };
  }
  private transformToGlobal(local: ElementPosition): ElementPosition {
    return {
      x: local.x * this.previewWidthRatio,
      y: local.y * this.previewHeightRatio,
      width: local.width * this.previewWidthRatio,
      height: local.height * this.previewHeightRatio
    };
  }

  private get previewWidthRatio() {
    return (
      streamDimensions(this.screenshareStream).width /
      this.screenshareSize.width
    );
  }
  private get previewHeightRatio() {
    return (
      streamDimensions(this.screenshareStream).height /
      this.screenshareSize.height
    );
  }
  // <!--</editor-fold>-->
}
</script>
