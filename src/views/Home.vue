<template>
  <t-container fluid>
    <t-row no-gutters v-if="errors.length > 0">
      <t-col>
        <div v-for="error in errors" :keY="error.component">
          <span class="text-error">{{ error.component }}</span>
          {{ error.message }}
        </div>
      </t-col>
    </t-row>
    <t-row v-if="screenshare">
      <t-col cols="12">
        <recording-pane
          @restart="deinit"
          :webcam-stream="webcamStream"
          :screenshare="screenshare"
          :stream-to-file="streamToFile"
          :microphone-track="microphoneTrack"
        ></recording-pane>
      </t-col>
    </t-row>
    <t-row v-else>
      <t-row no-gutters>
        <t-col>
          <t-row align-left>
            <t-col>
              <t-checkbox v-model="streamToFile">
                Stream to file
              </t-checkbox>
            </t-col>
          </t-row>
          <t-row align-left>
            <t-col>
              <t-checkbox v-model="useMicrophone">
                Use Microphone
              </t-checkbox>
            </t-col>
          </t-row>
          <t-row align-left>
            <t-col>
              <t-checkbox v-model="useWebcam">
                Use Webcam
              </t-checkbox>
            </t-col>
          </t-row>
        </t-col>
      </t-row>
      <t-row no-gutters>
        <t-col>
          <t-button @click="init">[Continue]</t-button>
        </t-col>
      </t-row>
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
import { getMicrophone, getScreen, getWebcam } from "@/util/MediaUtil";
import Resizer from "@/components/Resizer.vue";
import AbsolutePositioningPane from "@/components/AbsolutePositioningPane.vue";
import TButton from "@/components/TButton.vue";
import ResultPreview from "@/components/ResultPreview.vue";
import RecordingPane from "@/components/RecordingPane.vue";
import TCheckbox from "@/components/TCheckbox.vue";

type Error = {
  component: string;
  message: string;
};

@Component({
  components: {
    TCheckbox,
    RecordingPane,
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
  private webcamStream: MediaStream | null = null;
  private screenshare: MediaStream | null = null;
  private microphoneTrack: MediaStreamTrack | null = null;
  private streamToFile = true;
  private useMicrophone = true;
  private useWebcam = true;
  private errors: Error[] = [];

  private deinit() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(it => it.stop());
    }
    this.webcamStream = null;

    if (this.screenshare) {
      this.screenshare.getTracks().forEach(it => it.stop());
    }
    this.screenshare = null;

    if (this.microphoneTrack) {
      this.microphoneTrack.stop();
    }
    this.microphoneTrack = null;

    this.errors = [];
  }

  private async init() {
    this.errors = [];
    if (this.useWebcam) {
      await this.doWithError("Webcam", () =>
        getWebcam().then(it => (this.webcamStream = it))
      );
    }
    if (this.useMicrophone) {
      await this.doWithError("Microphone", () =>
        getMicrophone().then(micStream => {
          if (micStream) {
            this.microphoneTrack = micStream.getAudioTracks()[0];
          }
        })
      );
    }
    await this.doWithError("Screenshare", () =>
      getScreen().then(it => (this.screenshare = it))
    );
  }

  private async doWithError(component: string, func: () => Promise<unknown>) {
    try {
      await func();
    } catch (e) {
      this.errors.push({ component: component, message: e.message });
    }
  }
}
</script>

<style scoped>
.text-error {
  white-space: pre-line;
  min-width: 15ch;
  text-align: end;
  display: inline-block;
}
</style>
