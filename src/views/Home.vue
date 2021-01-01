<template>
  <t-container>
    <t-row>
      <t-col cols="12">
        <resizer
          v-if="myStream && streamDimensions"
          :width="webcamSize.width"
          :height="webcamSize.height"
          :max-height="streamDimensions.height"
          :max-width="streamDimensions.width"
          @resize="webcamSize = { width: $event.width, height: $event.height }"
        >
          <media-stream-display :stream="myStream"></media-stream-display>
        </resizer>
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
import { getWebcam, streamDimensions } from "@/util/MediaUtil";
import Resizer from "@/components/Resizer.vue";

@Component({
  components: { Resizer, MediaStreamDisplay, TCol, TRow, TContainer }
})
export default class Home extends Vue {
  private myStream: MediaStream | null = null;
  private webcamSize: { width: number | null; height: number | null } = {
    width: null,
    height: null
  };

  private get streamDimensions() {
    if (this.myStream) {
      return streamDimensions(this.myStream);
    }
    return undefined;
  }

  private async mounted() {
    this.myStream = await getWebcam();
  }
}
</script>
