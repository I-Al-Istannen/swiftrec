<template>
  <t-container fluid>
    <t-row v-if="screenshare">
      <t-col cols="12">
        <recording-pane
          :webcam-stream="webcamStream"
          :screenshare="screenshare"
        ></recording-pane>
      </t-col>
    </t-row>
    <t-row v-else>
      <t-col>
        <t-button @click="init">[Init]</t-button>
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
import { getScreen, getWebcam } from "@/util/MediaUtil";
import Resizer from "@/components/Resizer.vue";
import AbsolutePositioningPane from "@/components/AbsolutePositioningPane.vue";
import TButton from "@/components/TButton.vue";
import ResultPreview from "@/components/ResultPreview.vue";
import RecordingPane from "@/components/RecordingPane.vue";

@Component({
  components: {
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

  private async init() {
    this.webcamStream = await getWebcam();
    this.screenshare = await getScreen();
  }
}
</script>
