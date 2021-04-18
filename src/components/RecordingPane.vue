<template>
  <t-container fluid ref="root" no-gutter>
    <t-row v-if="!screenshare && !webcamStream" class="mt-6">
      <t-col cols="12" style="text-align: center">
        <em>Nothing found I could record.</em>
      </t-col>
      <t-col class="mt-1">
        <t-button
          color="warning"
          @click="restart"
          title="Brings you back to the home screen"
        >
          <strong>[Go back]</strong>
        </t-button>
      </t-col>
    </t-row>
    <t-row v-if="screenshare || webcamStream" no-gutters>
      <t-col v-if="!recorder">
        <t-dialog v-model="countdownDialogOpen" width="500">
          <template #activator="{ on }">
            <t-button :disabled="currentCountdown !== null" v-on="on">
              [Set countdown]
            </t-button>
          </template>

          <t-card>
            <template #title>
              <t-col>
                <h3>Set the recording countdown</h3>
              </t-col>
            </template>
            <template #text>
              <t-col>
                <t-form v-model="countdownValid">
                  <t-text-field
                    v-model="countdownSecondsStr"
                    :rules="[ruleIsPositiveNumber]"
                    placeholder="Countdown in seconds"
                  ></t-text-field>
                </t-form>
              </t-col>
            </template>
            <template #actions>
              <t-spacer></t-spacer>
              <t-button
                :disabled="!countdownValid"
                @click="countdownDialogOpen = false"
                class="mt-6"
              >
                <span v-if="!countdownSecondsStr">Do not use a countdown</span>
                <span v-else>Confirm countdown</span>
              </t-button>
            </template>
          </t-card>
        </t-dialog>
      </t-col>
      <t-col>
        <t-button
          class="ml-2"
          :disabled="currentCountdown !== null"
          @click="toggleRecording"
        >
          <span v-if="recorder">[Stop Recording]</span>
          <span v-if="!recorder && !currentCountdown && countdownSeconds === 0">
            [Start Recording]
          </span>
          <span v-if="!recorder && !currentCountdown && countdownSeconds !== 0">
            [Start Recording in {{ countdownSeconds }}s]
          </span>
          <span v-if="!recorder && currentCountdown">
            [Starting in {{ currentCountdown }}s]
          </span>
        </t-button>
      </t-col>
      <t-col v-if="blobDownloadLink" class="ml-2">
        <a
          :href="blobDownloadLink"
          download="Recording.webm"
          class="highlighted-link"
        >
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
          v-if="containerWidth && screenshareDimensions"
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
import { getSizeFull } from "@/util/MeasurementUtils";
import TDialog from "@/components/TDialog.vue";
import TCard from "@/components/TCard.vue";
import TTextField from "@/components/TTextField.vue";
import TSpacer from "@/components/TSpacer.vue";
import TForm from "@/components/TForm.vue";

@Component({
  components: {
    TForm,
    TSpacer,
    TTextField,
    TCard,
    TDialog,
    ResultPreview,
    TButton,
    TCol,
    TRow,
    TContainer
  }
})
export default class RecordingPane extends Vue {
  private webcamPosition: ElementPosition | null = null;
  private recorder: Recorder | null = null;
  private resultBlob: Blob | null = null;
  private containerWidth: number | null = null;
  private countdownDialogOpen = false;
  private countdownSecondsStr = "";
  private countdownValid = true;
  private currentCountdown: number | null = null;

  @Prop()
  private readonly webcamStream!: MediaStream | null;
  @Prop()
  private readonly audioTracks!: MediaStreamTrack[];
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

  private get countdownSeconds() {
    if (this.countdownSecondsStr === "") {
      return 0;
    }
    return parseInt(this.countdownSecondsStr);
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
      return null;
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
      if (this.countdownSeconds === 0) {
        this.startRecordingImmediately();
        return;
      }

      this.currentCountdown = this.countdownSeconds;

      const timer = setInterval(() => {
        if (this.currentCountdown) {
          this.currentCountdown -= 1;
        }
        if (this.currentCountdown === null || this.currentCountdown === 0) {
          clearInterval(timer);
          this.startRecordingImmediately();
          this.currentCountdown = null;
        }
      }, 1000);
    }
  }

  private startRecordingImmediately() {
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
      audioTracks: this.audioTracks
    });
    this.recorder.startRecording();
  }

  private get canvasSize() {
    if (this.screenshare) {
      return streamDimensions(this.screenshare);
    } else if (this.webcamStream) {
      return streamDimensions(this.webcamStream);
    }
    return null;
  }

  private updateContainerSize() {
    if (!this.canvasSize) {
      return null;
    }
    const { width } = this.canvasSize;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = (this.$refs["root"] as any).$el as HTMLElement;
    this.containerWidth = Math.min(getSizeFull(root).width * 0.8, width);
  }

  private restart() {
    if (
      window.confirm("Do you really want to restart the capturing process?")
    ) {
      this.$emit("restart");
    }
  }

  private ruleIsPositiveNumber(input: string) {
    // Allow leaving it empty
    if (!input) {
      return null;
    }
    const number = parseInt(input);
    if (Number.isNaN(number)) {
      return "Must be a number";
    }
    return number >= 0 ? null : "Must be positive";
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

<style scoped>
.highlighted-link {
  border-bottom: 2px dotted var(--color-primary);
  font-weight: bold;
}
</style>
