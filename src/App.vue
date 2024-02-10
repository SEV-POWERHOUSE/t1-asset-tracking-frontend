<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import MenuBar from "./components/MenuBar.vue";
import Footer from "./components/Footer.vue";
import Breadcrumb from"./components/Breadcrumb.vue"
</script>

<template>
  <v-app>
    <MenuBar :key="$route.fullPath" />
    <v-main>
      <Breadcrumb />
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>
