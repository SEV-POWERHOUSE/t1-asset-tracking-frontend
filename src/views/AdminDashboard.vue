<script setup>
import { ref, onMounted, watch } from "vue";

const showCheckoutDialog = ref(false);
const people = ref([]);
const recentCheckouts = ref([]);

const closeCheckoutDialog = () => {
  //resetForm(); // Resets form when closing or canceling the dialog
  showCheckoutDialog.value = false;
};

const headers = [
  { title: "Item", align: "start", key: "item" },
  { title: "Assignment", key: "assignment" },
  { title: "Date/Time", key: "dateTime" },
];

// Example items for the data table
const items = ref([
  {
    item: "IPhone 14",
    assignment: "Solomon Granger",
    dateTime: "February 14 3:00 P.M.",
  },
  {
    item: "MacBook Pro",
    assignment: "Jaxen McRay",
    dateTime: "February 16 5:30 P.M.",
  },
  {
    item: "Samsung Galaxy S21",
    assignment: "Zane Fike",
    dateTime: "February 20 12:05 P.M.",
  },
  {
    item: "Overhead Projector",
    assignment: "PEC 223",
    dateTime: "February 23 8:19 A.M.",
  },
  {
    item: "SMART Board",
    assignment: "HSH 212",
    dateTime: "February 25 12:18 P.M.",
  },
  {
    item: "RTAC",
    assignment: "Beam Library",
    dateTime: "February 27 10:53 A.M.",
  },
  {
    item: "Playstation 5",
    assignment: "Zane Fike",
    dateTime: "February 20 12:05 P.M.",
  },
  {
    item: "Overhead Projector",
    assignment: "PEC 223",
    dateTime: "February 23 8:19 A.M.",
  },
  {
    item: "Smartboard",
    assignment: "HSH 212",
    dateTime: "February 25 12:18 P.M.",
  },
  {
    item: "RTAC",
    assignment: "Beam Library",
    dateTime: "February 27 10:53 A.M.",
  },
]);
</script>

<template>
  <div>
    <v-container>
      <v-dialog v-model="showCheckoutDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Check Out Item</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-radio-group
                    v-model="inline"
                    inline
                    label="Choose Input Method"
                  >
                    <v-radio label="Scan" value="scan"></v-radio>
                    <v-radio label="Manual Entry" value="manualEntry"></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Serial Number"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select label="Select person"></v-select>
                </v-col>
                <v-col cols="12">
                  <v-radio-group v-model="inline" inline label="Duration">
                    <v-radio label="Indefinite" value="scan"></v-radio>
                    <v-radio label="Set" value="manualEntry"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="cancelgrey" @click="closeCheckoutDialog"
              >Cancel
            </v-btn>
            <v-btn color="saveblue" @click="closeCheckoutDialog"
              >Confirm Check Out</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-row class="mb-4 justify-space-between align-center">
        <v-col cols="12">
          <h2 class="text-center mb-4">Recent Activity</h2>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-data-table
            :headers="headers"
            :items="items"
            class="elevation-1 mb-4"
            caption="Asset Profiles"
            :items-per-page="5"
            :items-per-page-options="[5, 10, 20, 50, -1]"
          >
            <!-- Custom Header Slot -->
            <template v-slot:header="{ props: { headers } }">
              <thead>
                <tr>
                  <th
                    v-for="header in headers"
                    :key="header.text"
                    :align="header.align"
                  >
                    {{ header.title }}
                  </th>
                </tr>
              </thead>
            </template>
          </v-data-table>

          <div class="text-center">
            <v-btn
              size="large"
              color="primary"
              @click="showCheckoutDialog = true"
              >Check Out</v-btn
            >
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showCheckoutDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Check Out Asset</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-radio-group
                  v-model="inline"
                  inline
                  label="Choose Input Method"
                >
                  <v-radio label="Scan" value="scan"></v-radio>
                  <v-radio label="Manual Entry" value="manualEntry"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Serial Number"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select label="Select person"></v-select>
              </v-col>
              <v-col cols="12">
                <v-radio-group v-model="inline" inline label="Duration">
                  <v-radio label="Indefinite" value="scan"></v-radio>
                  <v-radio label="Set" value="manualEntry"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" @click="closeCheckoutDialog">Cancel </v-btn>
          <v-btn color="saveblue" @click="closeCheckoutDialog"
            >Confirm Check Out</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
