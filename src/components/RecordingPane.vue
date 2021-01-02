<template>
  <t-container fluid ref="root" no-gutter>
    <t-row v-if="screenshare && webcamStream" no-gutters>
      <t-col>
        <t-button @click="toggleRecording">
          {{ recorder ? "[Stop Recording]" : "[Start Recording]" }}
        </t-button>
      </t-col>
      <t-col v-if="blobDownloadLink">
        <a :href="blobDownloadLink">Click me</a>
      </t-col>
    </t-row>
    <t-row no-gutters>
      <t-col>
        <result-preview
          v-if="screenshare && containerWidth"
          :screenshare-size="screenshareDimensions"
          :screenshare-stream="screenshare"
          :webcam-stream="webcamStream"
          v-model="webcamPosition"
        ></result-preview>
      </t-col>
    </t-row>
  </t-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "@/components/TContainer.vue";
import TRow from "@/components/TRow.vue";
import TCol from "@/components/TCol.vue";
import TButton from "@/components/TButton.vue";
import ResultPreview from "@/components/ResultPreview.vue";
import { ElementPosition } from "@/store/Types";
import Recorder from "@/util/Recorder";
import { streamDimensions } from "@/util/MediaUtil";
import { Prop, Watch } from "vue-property-decorator";

@Component({
  components: { ResultPreview, TButton, TCol, TRow, TContainer }
})
export default class RecordingPane extends Vue {
  private webcamPosition: ElementPosition | null = null;
  private recorder: Recorder | null = null;
  private resultBlob: Blob | null = null;
  // Set in mounted
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private containerWidth: number | null = null;

  @Prop()
  private readonly webcamStream!: MediaStream | null;
  @Prop()
  private readonly screenshare!: MediaStream;

  private get blobDownloadLink() {
    if (!this.resultBlob) {
      return null;
    }
    return URL.createObjectURL(this.resultBlob);
  }

  private get screenshareDimensions() {
    if (!this.containerWidth) {
      throw Error(":(");
    }

    const { width, height } = streamDimensions(this.screenshare);
    const newWidth = this.containerWidth;
    const originalRatio = height / width;
    return {
      width: newWidth,
      height: newWidth * originalRatio
    };
  }

  @Watch("webcamPosition")
  private onWebcamPositionUpdate() {
    if (this.recorder && this.webcamPosition) {
      this.recorder.setWebcamLocation(this.webcamPosition);
    }
  }

  private toggleRecording() {
    if (this.recorder) {
      this.recorder.stopRecording();
      this.recorder = null;
    } else {
      this.resultBlob = null;
      this.recorder = new Recorder(
        this.webcamPosition || { x: 0, y: 0, width: 0, height: 0 },
        this.screenshare,
        this.webcamStream,
        blob => (this.resultBlob = blob)
      );
      this.recorder.startRecording();
    }
  }

  private updateContainerSize() {
    const { width } = streamDimensions(this.screenshare);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = (this.$refs["root"] as any).$el as HTMLElement;
    this.containerWidth = Math.min(
      root.getBoundingClientRect().width * 0.8,
      width
    );
  }

  private mounted() {
    this.updateContainerSize();
  }

  private created() {
    window.addEventListener("resize", this.updateContainerSize);
  }
  private destroyed() {
    window.removeEventListener("resize", this.updateContainerSize);
  }
}
</script>
