<script>
import { ref, onMounted } from "vue";
import ocLogo from "/src/oc-logo-maroon.png";

export default {
  setup() {
    const logoURL = ref('');

    onMounted(() => {
      logoURL.value = ocLogo;
    });

    return {
      logoURL
    };
  }
}

</script>

<template>
  <v-footer color="primary" class="flex-grow-0 flex-shrink-0 pa-0 ma-0" height=60>
    <v-row justify="space-between" class="mx-0">
      <v-col class="pl-7">
        Oklahoma Christian University — {{ new Date().getFullYear() }}
      </v-col>
    </v-row>
  </v-footer>
</template>



<!-- Love, Zane -->
