<script setup>
import SocialLogin from "../components/SocialLogin.vue";
</script>

<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <!-- About Info Area -->
        <v-card class="pa-3 mb-10" outlined>
          <!-- increased margin-bottom to mb-4 -->
          <v-card-title class="text-h6">
            Welcome to OC's Asset Tracking Application!
          </v-card-title>
          <v-card-text>
            The Asset Tracking App is designed to help manage and track OC
            assets efficiently, focusing on asset acquisition, location,
            assignment to individuals, and maintenance.
          </v-card-text>
        </v-card>

        <SocialLogin />
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
/* Adjust margins as needed */
.my-2 {
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
