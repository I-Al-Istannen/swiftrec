<template>
  <video muted :srcObject.prop="stream" autoplay></video>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TContainer from "./TContainer.vue";
import TCol from "./TCol.vue";
import TRow from "./TRow.vue";
import { Prop } from "vue-property-decorator";

@Component({
  components: { TRow, TCol, TContainer }
})
export default class MediaStreamDisplay extends Vue {
  @Prop()
  private readonly stream!: MediaStream;

  @Prop({ default: null })
  private readonly width!: number | null;

  @Prop({ default: null })
  private readonly height!: number | null;
}
</script>

<style scoped>
video {
  height: 100%;
  width: 100%;
}
</style>
