<script setup>
import UserAccommodationRequestServices from "../services/userAccommodationRequestServices";
import Utils from "../config/utils.js";
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userAccommodationRequests = ref([]);
const user = Utils.getStore("user");
const message = ref("");

const retrieveUserAccommodationRequests = () => {
  UserAccommodationRequestServices.getAllForUser(user.userId)
    .then((response) => {
      if (response.status === 200) {
        userAccommodationRequests.value = response.data;
      } else {
        console.error(`Error retrieving accommodation requests: ${response.status}`);
      }
    })
    .catch((e) => {
      console.error(e.response?.data?.message || e.message);
      message.value = "An error occurred while retrieving accommodation requests.";
      userAccommodationRequests.value = []; // Ensure it's an empty array if there's an error
    });
};

retrieveUserAccommodationRequests();

watchEffect(() => {
  message.value = userAccommodationRequests.value.length === 0
    ? "You currently have no active accommodation requests. Please make a request."
    : "Current Accommodation Requests";
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>
          Hello, {{ user.fName }} {{ user.lName }}!
        </v-toolbar-title>
        <v-btn 
          outlined
          color=""
          class="ml-auto"
          @click="router.push({ name: 'request' })"
        >
          Make a Request
        </v-btn>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title> Accommodation Requests </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table v-if="userAccommodationRequests.length > 0">
          <thead>
            <tr>
              <th class="text-left"> Request ID</th>
              <th class="text-left">Semester</th>
              <th class="text-left">Name</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in userAccommodationRequests" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.semester.title }}</td>
              <td>{{ item.user?.fName }} {{ item.user?.lName }}</td>
              <td>{{ item.status }}</td>
            </tr>
          </tbody>
        </v-table>
        <div v-else>
          <!-- This will show when there are no accommodations -->
        </div>
      </v-card>
    </v-container>
  </div>
</template>