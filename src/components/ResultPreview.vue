<template>
  <absolute-positioning-pane
    style="border: 2px solid var(--color-warning)"
    :width="screenshareSize.width"
    :height="screenshareSize.height"
  >
    <resizer
      style="z-index: 10"
      :width="webcamSize.width"
      :height="webcamSize.height"
      :max-height="webcamSize.height"
      :max-width="webcamSize.width"
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
import { Prop } from "vue-property-decorator";

@Component({
  components: { AbsolutePositioningPane, Resizer, MediaStreamDisplay }
})
export default class ResultPreview extends Vue {
  @Prop()
  private readonly screenshareSize!: StreamSize;
  @Prop()
  private readonly screenshareStream!: MediaStream;

  @Prop()
  private readonly webcamSize!: StreamSize;
  @Prop()
  private readonly webcamStream!: MediaStream;

  private webcamResized(newSize: StreamSize) {
    const newPosition: ElementPosition = {
      x: 0,
      y: 0,
      ...newSize
    };
    this.$emit("webcam-position", newPosition);
  }
}
</script>
