<template>
  <t-container fluid ref="root">
    <t-row v-if="screenshare && myStream">
      <t-col>
        <t-button @click="toggleRecording">
          {{ recorder ? "[Stop Recording]" : "[Start Recording]" }}
        </t-button>
      </t-col>
      <t-col v-if="blobDownloadLink">
        <a :href="blobDownloadLink">Click me</a>
      </t-col>
    </t-row>
    <t-row>
      <t-col>
        <result-preview
          v-if="
            webcamDimensions && myStream && screenshare && screenshareDimensions
          "
          :screenshare-size="screenshareDimensions"
          :screenshare-stream="screenshare"
          :webcam-size="webcamDimensions"
          :webcam-stream="myStream"
        ></result-preview>
        <t-button v-else @click="init">[Init]</t-button>
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
import MediaStreamDisplay from "@/components/MediaStreamDisplay.vue";
import { getScreen, getWebcam, streamDimensions } from "@/util/MediaUtil";
import Resizer from "@/components/Resizer.vue";
import AbsolutePositioningPane from "@/components/AbsolutePositioningPane.vue";
import TButton from "@/components/TButton.vue";
import Recorder from "@/util/Recorder";
import ResultPreview from "@/components/ResultPreview.vue";

@Component({
  components: {
    ResultPreview,
    TButton,
    AbsolutePositioningPane,
    Resizer,
    MediaStreamDisplay,
    TCol,
    TRow,
    TContainer
  }
})
export default class Home extends Vue {
  private myStream: MediaStream | null = null;
  private screenshare: MediaStream | null = null;
  private webcamSize: { width: number | null; height: number | null } = {
    width: null,
    height: null
  };
  private recorder: Recorder | null = null;
  private resultBlob: Blob | null = null;

  private get webcamDimensions() {
    if (this.myStream) {
      return streamDimensions(this.myStream);
    }
    return undefined;
  }

  private get blobDownloadLink() {
    if (!this.resultBlob) {
      return null;
    }
    return URL.createObjectURL(this.resultBlob);
  }

  private get screenshareDimensions() {
    if (this.screenshare) {
      const { width, height } = streamDimensions(this.screenshare);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const root = (this.$refs["root"] as any).$el as HTMLElement;
      const newWidth = Math.min(
        root.getBoundingClientRect().width * 0.8,
        width
      );
      const originalRatio = height / width;
      return {
        width: newWidth,
        height: newWidth * originalRatio
      };
    }
    return undefined;
  }

  private toggleRecording() {
    if (!this.screenshare || !this.myStream || !this.webcamDimensions) {
      return;
    }
    if (this.recorder) {
      this.recorder.stopRecording();
      this.recorder = null;
    } else {
      this.resultBlob = null;
      this.recorder = new Recorder(
        { x: 0, y: 0, ...this.webcamDimensions },
        this.screenshare,
        this.myStream,
        blob => (this.resultBlob = blob)
      );
      this.recorder.startRecording();
    }
  }

  private async init() {
    this.myStream = await getWebcam();
    this.screenshare = await getScreen();
  }
}
</script>
