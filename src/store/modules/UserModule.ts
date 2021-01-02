import { createModule } from "vuex-class-component";

const VuexModule = createModule({
  namespaced: "user",
  strict: false
});

export class UserModule extends VuexModule {}
