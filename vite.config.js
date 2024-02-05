import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { resolve } from 'path';

import dns from "dns";
dns.setDefaultResultOrder("verbatim");

export default () => {
  const baseURL = process.env.APP_ENV === "development" ? "/" : "/asset/t1/";

  return defineConfig({
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    plugins: [vue(), vuetify({ autoImport: true })],
    server: {
      host: "localhost",
      port: 8081,
    },
    base: baseURL,
  });
};
