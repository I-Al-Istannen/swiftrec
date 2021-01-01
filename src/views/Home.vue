<template>
  <t-container fluid ref="root">
    <t-row>
      <t-col>
        <absolute-positioning-pane
          style="border: 2px solid var(--color-warning)"
          v-if="screenshareDimensions"
          :width="screenshareDimensions.width"
          :height="screenshareDimensions.height"
        >
          <resizer
            style="z-index: 10"
            v-if="myStream && webcamDimensions"
            :width="webcamSize.width"
            :height="webcamSize.height"
            :max-height="webcamDimensions.height"
            :max-width="webcamDimensions.width"
            @resize="
              webcamSize = { width: $event.width, height: $event.height }
            "
          >
            <media-stream-display :stream="myStream"></media-stream-display>
          </resizer>
          <media-stream-display
            v-if="screenshare"
            :stream="screenshare"
          ></media-stream-display>
        </absolute-positioning-pane>
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

@Component({
  components: {
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

  private get webcamDimensions() {
    if (this.myStream) {
      return streamDimensions(this.myStream);
    }
    return undefined;
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

  private async init() {
    this.myStream = await getWebcam();
    this.screenshare = await getScreen();
  }
}
</script>
