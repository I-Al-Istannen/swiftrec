import Vue from "vue";
import Vuex from "vuex";
import { extractVuexModule, createProxy } from "vuex-class-component";
import createPersistedState from "vuex-persistedstate";
import { UserModule } from "@/store/modules/UserModule";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    baseUrl: process.env.VUE_APP_BASE_URL
  },
  modules: {
    ...extractVuexModule(UserModule)
  },
  plugins: [
    createPersistedState({
      paths: ["user.token"],
      storage: localStorage
    })
  ]
});

// Proxies
export const vxm = {
  user: createProxy(store, UserModule)
};
