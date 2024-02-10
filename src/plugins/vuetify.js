/**
 * Vuetify3 Plugin
 */
import { createVuetify } from "vuetify";
// Import components that are not currently added to vuetify 3 
// (Mainly for v-data-table)
import * as components from "vuetify/components"
import * as labsComponents from "vuetify/labs/components"

// Misc
import { loadFonts } from "./webfontloader";
loadFonts();

// Styles
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: "#801429",
    secondary: "#E1E1E1",
    accent: "#47121D",
    success: "#47121D",
    error: "#EE5044",
    teal: "#63BAC0",
    blue: "#196CA2",
    yellow: "#F8C545",
    darkblue: "#032F45",
    background: "#FFFFFF"
  }
};

const vuetify = createVuetify({
  // Import components that are not currently added to vuetify 3 
  // (Mainly for v-data-table)
  components : {
    ...components,
    ...labsComponents,
    },
  theme: {
    defaultTheme: "myCustomLightTheme",
    themes: {
      myCustomLightTheme,
    },
  },
  icons: {
    defaultSet: "mdi",
  },
});

export default vuetify;
