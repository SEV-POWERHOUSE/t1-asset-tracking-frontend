import { defineConfig } from "cypress";
import dotenv from "dotenv";
const env = dotenv.config("./.env").parsed;

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8081",
    env: {
      googleRefreshToken: env.VITE_APP_REFRESH_TOKEN,
      googleClientId: env.VITE_APP_CLIENT_ID,
      googleClientSecret: env.VITE_APP_CLIENT_SECRET,
      clientUrl: env.VITE_APP_CLIENT_URL,
    },
  },
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
