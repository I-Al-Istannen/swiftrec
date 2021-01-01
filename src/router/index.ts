import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

type RouteConfigEx = {
  path: string;
  name: string;
  component: typeof Vue;
  meta: {
    title: string;
    navigable: boolean;
  };
};

export const routes: RouteConfigEx[] = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      title: "Heimat",
      navigable: true
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.afterEach(to => {
  document.title = "SwiftRec - " + to.meta.title;
});

export default router;
