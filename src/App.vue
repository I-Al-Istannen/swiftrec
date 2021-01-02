<template>
  <div id="app">
    <navigation-bar></navigation-bar>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import NavigationBar from "@/components/NavigationBar.vue";
import { Breakpoints } from "@/util/Breakpoints";

@Component({
  components: { NavigationBar }
})
export default class App extends Vue {
  // Needs to be here to be reactive...
  private breakpoints: Breakpoints = new Breakpoints();

  private created() {
    Vue.prototype.$breakpoints = this.breakpoints;
    Vue.prototype.$breakpoints.setup();
  }

  private destroy() {
    Vue.prototype.$breakpoints.teardown();
  }
}
</script>

<style>
* {
  --color-background: #1c1e21;
  --color-primary: #5f85db;
  --color-accent: #90b8f8;
  --color-text: #dddddd;
  --color-text-dimmed: #6e6e6e;
  --color-text-highlight: white;
  --color-background-dimmed: #353941;
  --color-background-highlight: #353941;
  --color-warning: #ee4540;
  --color-warning-dimmed: #801336;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100%;
  position: relative;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: "Source Code Pro", monospace;
  font-size: 16px;
}

h1,
h2,
h3,
h4 {
  margin-top: 1ch;
  margin-bottom: 1ch;
}

em {
  text-shadow: 0 0 5px #ffffff;
  color: var(--color-text-highlight);
}

a {
  color: var(--color-primary);
  text-decoration: none;
}
a:hover {
  color: var(--color-accent);
}
a.disabled {
  color: var(--color-text-dimmed);
}
a.router-link-exact-active {
  border-bottom: 2px dotted;
}
a.router-link-exact-active.concealed-router-link {
  border-bottom: none;
}

.text-error {
  color: var(--color-warning);
  font-weight: bold;
}

.d-inline-block {
  display: inline-block;
}

.mr-2 {
  margin-right: 8px;
}
.ml-2 {
  margin-left: 8px;
}
.mt-2 {
  margin-top: 8px;
}
.mr-6 {
  margin-right: 24px;
}
.ml-6 {
  margin-left: 24px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mt-0 {
  margin-top: 0;
}
</style>
