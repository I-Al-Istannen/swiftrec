import Vue from "vue";

export type Breakpoint = {
  maxSize: number;
  name: string;
};

export const breakpoints: readonly Breakpoint[] = Object.freeze([
  { maxSize: 600, name: "xs" },
  { maxSize: 960, name: "sm" },
  { maxSize: 1264, name: "md" },
  { maxSize: 1904, name: "lg" },
  { maxSize: 1e20, name: "xl" }
]);

export class Breakpoints {
  // noinspection TypeScriptFieldCanBeMadeReadonly
  currentBreakpoint: Breakpoint = breakpoints[0];
  private readonly listener: () => void;

  constructor() {
    this.listener = () => this.updateBreakpoint();
  }

  private updateBreakpoint() {
    for (const breakpoint of breakpoints) {
      const query = `screen and (max-width: ${breakpoint.maxSize}px)`;

      if (window.matchMedia(query).matches) {
        Vue.set(this, "currentBreakpoint", breakpoint);
        return;
      }
    }
  }

  public setup() {
    this.updateBreakpoint();
    window.addEventListener("resize", this.listener);
  }

  public teardown() {
    window.removeEventListener("resize", this.listener);
  }
}
