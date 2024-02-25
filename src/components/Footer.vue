<script>
import { ref, onMounted } from "vue";
import ocLogo from "/src/oc-logo-maroon.png";

export default {
  setup() {
    const logoURL = ref('');

    onMounted(() => {
      logoURL.value = ocLogo;
    });

    console.log(ocLogo); // Ensure the correct URL is logged

    return {
      logoURL
    };
  }
}

</script>

<template>
    <v-footer color="primary" class="flex-grow-0 flex-shrink-0 pa-0 ma-0" height=68>
      <v-row justify="space-between" class="mx-0">
        <v-col justify="left">
            Oklahoma Christian University — {{ new Date().getFullYear() }}
        </v-col>
        <v-col class="pa-0">
          <v-img
            :src="logoURL"
            height="60"
            width="60"
            class="logo"
          ></v-img>
        </v-col>
      </v-row>
    </v-footer>
</template>

<style scoped>
  .logo {
    position: fixed;
    bottom: 0; /* Adjust as needed */
    right: 0; /* Adjust as needed */
  }
</style>

<!-- Love, Zane -->
