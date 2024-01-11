<script setup>
import UserAccommodationServices from "../services/userAccommodationServices";
import Utils from "../config/utils.js";
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userAccommodations = ref([]);
const user = Utils.getStore("user");
const message = ref("");

const retrieveUserAccommodations = () => {
  UserAccommodationServices.getAllForUser(user.userId)
    .then((response) => {
      if (response.status === 200) {
        userAccommodations.value = response.data;
      } else {
        console.error(`Error retrieving accommodations: ${response.status}`);
      }
    })
    .catch((e) => {
      console.error(e.response?.data?.message || e.message);
      message.value = "An error occurred while retrieving accommodations.";
      userAccommodations.value = []; // Ensure it's an empty array if there's an error
    });
};

retrieveUserAccommodations();

watchEffect(() => {
  message.value = userAccommodations.value.length === 0
    ? "You currently have no accommodations. Please request for one."
    : "Your Accommodations";
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>
          Hello, {{ user.fName }} {{ user.lName }}!
        </v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title> Accommodations </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table v-if="userAccommodations.length > 0">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Category</th>
              <th class="text-left">Title</th>
              <th class="text-left">Semester</th>
              <th class="text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in userAccommodations" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.accommodationCategory?.categoryName }}</td>
              <td>{{ item.accommodation?.title }}</td>
              <td>{{ item.semester?.title }}</td>
              <td>{{ item.user?.fName }} {{ item.user?.lName }}</td>
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