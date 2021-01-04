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
    <t-row v-if="ready">
      <t-col cols="12">
        <recording-pane
          @restart="deinit"
          :webcam-stream="webcamStream"
          :screenshare="screenshare"
          :stream-to-file="streamToFile"
          :audio-tracks="audioTracks"
        ></recording-pane>
      </t-col>
    </t-row>
    <t-row v-else>
      <t-row no-gutters>
        <t-form v-model="formValid">
          <t-col>
            <t-container wrap no-gutter style="flex-direction: column">
              <t-row align-left wrap>
                <t-col cols="12">
                  <t-checkbox v-model="streamToFile">
                    Stream video to file
                  </t-checkbox>
                </t-col>
              </t-row>
              <t-row align-left wrap>
                <t-col cols="12">
                  <t-checkbox v-model="useMicrophone">
                    Record your Microphone
                  </t-checkbox>
                </t-col>
              </t-row>
              <t-row align-left wrap>
                <t-col cols="12">
                  <t-checkbox v-model="useWebcam" :rules="[sourceSelected]">
                    Record your Webcam
                  </t-checkbox>
                </t-col>
              </t-row>
              <t-row align-left wrap>
                <t-col cols="12">
                  <t-checkbox
                    :disabled="!canShareScreen"
                    :checked="useScreen"
                    @checked="useScreenPref = $event"
                    :error-message="
                      canShareScreen ? null : 'Not available on your client'
                    "
                    :rules="[sourceSelected]"
                  >
                    Share your screen
                  </t-checkbox>
                </t-col>
              </t-row>
              <t-row no-gutters>
                <t-col>
                  <t-button
                    class="mt-2"
                    :disabled="!formValid || waitingForPermissions"
                    @click="init"
                  >
                    [Continue]
                  </t-button>
                </t-col>
              </t-row>
            </t-container>
          </t-col>
        </t-form>
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
import RecordingPane from "@/components/RecordingPane.vue";
import TCheckbox from "@/components/TCheckbox.vue";
import TForm from "@/components/TForm.vue";

type Error = {
  component: string;
  message: string;
};

@Component({
  components: {
    TForm,
    TCheckbox,
    RecordingPane,
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
  private audioTracks: MediaStreamTrack[] = [];
  private streamToFile = true;
  private useMicrophone = true;
  private useWebcam = true;
  private useScreenPref = true;
  private errors: Error[] = [];
  private formValid = true;
  private ready = false;
  private waitingForPermissions = false;

  private get canShareScreen() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(navigator.mediaDevices as any).getDisplayMedia;
  }

  private get useScreen() {
    return this.useScreenPref && this.canShareScreen;
  }

  private sourceSelected(input: boolean) {
    if (this.useWebcam || this.useScreen) {
      return null;
    }
    if (input) {
      return null;
    }
    return "Webcam/Screenshare needed";
  }

  private lostTrackAccess() {
    this.errors = [
      {
        component: "Lost Access",
        message:
          "I lost access to your devices, did you revoke it? Operation can not" +
          " continue, please click 'Change Settings' when you are ready."
      }
    ];
  }

  private deinit() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(it => it.stop());
    }
    this.webcamStream = null;

    if (this.screenshare) {
      this.screenshare.getTracks().forEach(it => it.stop());
    }
    this.screenshare = null;

    if (this.audioTracks.length !== 0) {
      this.audioTracks.forEach(it => it.stop());
    }
    this.audioTracks = [];

    this.errors = [];
    this.ready = false;
    this.waitingForPermissions = false;
  }

  private async init() {
    this.waitingForPermissions = true;
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
            this.audioTracks.push(micStream.getAudioTracks()[0]);
          }
        })
      );
    }
    if (this.useScreen) {
      await this.doWithError("Screenshare", () =>
        getScreen().then(it => (this.screenshare = it))
      );
    }

    this.ready = true;
    this.waitingForPermissions = false;

    if (this.audioTracks) {
      this.audioTracks.forEach(track => (track.onended = this.lostTrackAccess));
    }
    if (this.webcamStream) {
      this.webcamStream
        .getTracks()
        .forEach(track => (track.onended = this.lostTrackAccess));
    }
    if (this.screenshare) {
      this.screenshare
        .getTracks()
        .forEach(track => (track.onended = this.lostTrackAccess));
    }
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
