<template>
  <t-container fluid>
    <t-row v-if="screenshare">
      <t-col cols="12">
        <recording-pane
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
          <t-button @click="init">[Init]</t-button>
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

  private async init() {
    if (this.useWebcam) {
      try {
        this.webcamStream = await getWebcam();
      } catch (e) {
        console.log(e);
      }
    }
    if (this.useMicrophone) {
      try {
        const micStream = await getMicrophone();
        if (micStream) {
          this.microphoneTrack = micStream.getAudioTracks()[0];
        }
      } catch (e) {
        console.log(e);
      }
    }
    this.screenshare = await getScreen();
  }
}
</script>
