<template>
  <div class="t-col" :class="computedClass" @click="$emit('click', $event)">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

type ColumnType =
  | "auto"
  | "wrap"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | null;

@Component
export default class TCol extends Vue {
  @Prop({ default: null })
  private readonly cols!: ColumnType;

  @Prop({ default: null })
  private readonly sm!: ColumnType;

  @Prop({ default: null })
  private readonly md!: ColumnType;

  @Prop({ default: false, type: Boolean })
  private readonly noGutter!: boolean;

  private get currentBreakpointName() {
    return this.$breakpoints.currentBreakpoint.name;
  }

  private get computedClass() {
    const classes: { [key: string]: boolean } = {
      "no-gutter": this.noGutter
    };
    classes[this.colProperty] = true;
    return classes;
  }

  private get colProperty() {
    let colsValue: ColumnType;
    if (this.currentBreakpointName === "xs") {
      colsValue = this.cols;
    } else if (this.currentBreakpointName === "sm" && this.sm) {
      colsValue = this.sm;
    } else if (this.md) {
      colsValue = this.md;
    } else if (this.sm) {
      colsValue = this.sm;
    } else {
      colsValue = this.cols;
    }

    if (colsValue === null) {
      return "";
    }

    return "t-col-" + colsValue;
  }
}
</script>

<style scoped>
.t-col {
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;

  padding: 0.5ch;
}
.t-col-auto {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}
.t-col-wrap {
  flex-basis: 0;
  flex-grow: 1;
  max-width: max-content;
}
.t-col-1 {
  flex: 0 0 8.33%;
  max-width: 8.33%;
}
.t-col-2 {
  flex: 0 0 16.66%;
  max-width: 16.66%;
}
.t-col-3 {
  flex: 0 0 25%;
  max-width: 25%;
}
.t-col-4 {
  flex: 0 0 33.33%;
  max-width: 33.33%;
}
.t-col-5 {
  flex: 0 0 41.66%;
  max-width: 41.66%;
}
.t-col-6 {
  flex: 0 0 50%;
  max-width: 50%;
}
.t-col-7 {
  flex: 0 0 58.33%;
  max-width: 58.33%;
}
.t-col-8 {
  flex: 0 0 66.66%;
  max-width: 66.66%;
}
.t-col-9 {
  flex: 0 0 75%;
  max-width: 75%;
}
.t-col-10 {
  flex: 0 0 83.33%;
  max-width: 83.33%;
}
.t-col-11 {
  flex: 0 0 91.66%;
  max-width: 91.66%;
}
.t-col-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

.t-col.no-gutter {
  margin: 0;
  padding: 0;
}
</style>
