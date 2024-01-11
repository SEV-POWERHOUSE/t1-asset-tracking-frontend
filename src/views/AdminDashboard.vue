<script setup>
import { ref, watchEffect, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import UserAccommodationRequestServices from "../services/userAccommodationRequestServices";

const router = useRouter();
const userAccommodationRequests = ref([]);
const user = Utils.getStore("user");
const message = ref("");
const selectedStatus = ref(''); // To hold the filter status

const filteredUserAccommodationRequests = computed(() => {
  if (!selectedStatus.value) {
    return userAccommodationRequests.value;
  }
  return userAccommodationRequests.value.filter(request => request.status === selectedStatus.value);
});

const viewUserAccommodationRequest = (userAccommodationRequest) => {
  router.push({ name: "view", params: { id: userAccommodationRequest.id } });
};

watchEffect(() => {
  message.value = userAccommodationRequests.value.length === 0
    ? "There are currently no active accommodation requests."
    : "Active Accommodation Requests";
});

const retrieveUserAccommodationRequests = () => {
  UserAccommodationRequestServices.getAll()
    .then((response) => {
      userAccommodationRequests.value = response.data || [];
    })
    .catch((e) => {
      console.error(e.response?.data?.message || e.message);
      userAccommodationRequests.value = [];
    });
};

const deleteUserAccommodationRequest = async (id) => {
  try {
    const response = await UserAccommodationRequestServices.delete(id);
    if (response.data.message === "userAccommodationRequest was deleted successfully!") {
      // Filter out the deleted request from the local state
      userAccommodationRequests.value = userAccommodationRequests.value.filter(
        (request) => request.id !== id
      );
    }
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
  }
};


retrieveUserAccommodationRequests();
</script>

<template>
    <div>
      <v-container>
        <v-toolbar>
          <v-toolbar-title>Welcome, {{ user.fName }} {{ user.lName }}!</v-toolbar-title>
        </v-toolbar>
        <br /><br />
        <v-select
        v-model="selectedStatus"
        :items="['', 'Pending', 'Approved', 'Declined']"
        label="Filter by status"
        solo
        @change="retrieveUserAccommodationRequests"
        ></v-select>
        <v-card>
          <v-card-title> Admin Dashboard </v-card-title>
          <v-card-text>
            <b>{{ message }}</b>
          </v-card-text>
          <v-table>
          <thead>
            <tr>
              <th class="text-left">Request ID</th>
              <th class="text-left">Semester</th>
              <th class="text-left">Name</th>
              <th class="text-left">Status</th>
              <th class="text-left">View</th>
              <th class="text-left">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredUserAccommodationRequests" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.semester.title }}</td>
              <td>{{ item.user.fName }} {{ item.user.lName }}</td>
              <td>{{ item.status }}</td>
              <td>
                <v-icon small class="mx-4" @click="viewUserAccommodationRequest(item)">
                  mdi-format-list-bulleted-type
                </v-icon>
              </td>
              <td>
                <v-btn icon color="red" @click="deleteUserAccommodationRequest(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        </v-card>
      </v-container>
    </div>
  </template>
  