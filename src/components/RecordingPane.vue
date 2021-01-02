<template>
  <t-container fluid ref="root" no-gutter>
    <t-row v-if="screenshare || webcamStream" no-gutters>
      <t-col>
        <t-button @click="toggleRecording">
          {{ recorder ? "[Stop Recording]" : "[Start Recording]" }}
        </t-button>
      </t-col>
      <t-col v-if="blobDownloadLink" class="ml-2">
        <a :href="blobDownloadLink" download="Recording.webm">
          [Save Recording]
        </a>
      </t-col>
      <t-col class="ml-6">
        <t-button
          color="warning"
          @click="restart"
          title="Brings you back to the home screen"
        >
          [Change Settings]
        </t-button>
      </t-col>
    </t-row>
    <t-row no-gutters>
      <t-col>
        <result-preview
          v-if="containerWidth"
          :canvas-size="canvasSize"
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
  private containerWidth: number | null = null;

  @Prop()
  private readonly webcamStream!: MediaStream | null;
  @Prop()
  private readonly microphoneTrack!: MediaStreamTrack | null;
  @Prop()
  private readonly screenshare!: MediaStream | null;
  @Prop()
  private readonly streamToFile!: boolean;

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

    let width: number;
    let height: number;

    if (this.screenshare) {
      width = streamDimensions(this.screenshare).width;
      height = streamDimensions(this.screenshare).height;
    } else if (this.webcamStream) {
      width = streamDimensions(this.webcamStream).width;
      height = streamDimensions(this.webcamStream).height;
    } else {
      throw Error(":(");
    }

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
      this.recorder = new Recorder({
        webcamLocation: this.webcamPosition || {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        },
        screenSize: this.canvasSize,
        screenStream: this.screenshare || undefined,
        webcamStream: this.webcamStream || undefined,
        finishCallback: blob => (this.resultBlob = blob || null),
        streamToFile: this.streamToFile,
        microphoneTrack: this.microphoneTrack || undefined
      });
      this.recorder.startRecording();
    }
  }

  private get canvasSize() {
    if (this.screenshare) {
      return streamDimensions(this.screenshare);
    } else if (this.webcamStream) {
      return streamDimensions(this.webcamStream);
    }
    throw Error(":(");
  }

  private updateContainerSize() {
    const { width } = this.canvasSize;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = (this.$refs["root"] as any).$el as HTMLElement;
    this.containerWidth = Math.min(
      root.getBoundingClientRect().width * 0.8,
      width
    );
  }

  private restart() {
    if (
      window.confirm("Do you really want to restart the capturing process?")
    ) {
      this.$emit("restart");
    }
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
