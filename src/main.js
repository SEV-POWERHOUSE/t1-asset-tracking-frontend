import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import store from "./store/store";
import vuetify from "./plugins/vuetify.js";

createApp(App)
  .use(store)
  .use(vuetify)
  .use(router)
  .mount("#app");