<script setup>
import { ref, onMounted, watch } from "vue";

const showCheckoutDialog = ref(false);
const people = ref([]);
const recentCheckouts= ref([]);



const closeCheckoutDialog = () => {
  //resetForm(); // Resets form when closing or canceling the dialog
  showCheckoutDialog.value = false;
};

const headers = [
  { title: "Item", align: "start", sortable: false, key: "item" },
  { title: "Assignment", key: "assignment" },
  { title: "Date/Time", key: "dateTime" },
  
];

// Example items for the data table
const items = ref([
  { item: "IPhone 14", assignment: "Solomon Granger", dateTime: "February 14 3:00 P.M." },
  { item: "Apple Vision Pro", assignment: "Jaxen Mcray", dateTime: "February 16 5:30 P.M." },
  { item: "Playstation 5", assignment: "Zane Fike", dateTime: "February 20 12:05 P.M." },
  { item: "Overhead Projector", assignment: "PEC 223", dateTime: "February 23 8:19 A.M." },
  { item: "Smartboard", assignment: "HSH 212", dateTime: "February 25 12:18 P.M." },
  { item: "RTAC", assignment: "Beam Library", dateTime: "February 27 10:53 A.M."  },
]);



</script>

<template>
  <div>

    <v-container>
      
     
      <v-row class="mb-4"> <!-- Adds bottom margin for spacing -->
        <v-col cols="12" class="d-flex justify-center align-center">
          <span class="flex-grow-1 text-center">Recent Activity</span> <!-- Centers the title and allows it to grow -->
          <v-btn size = "large" color="primary" @click="showCheckoutDialog = true;" class="ml-auto">Check Out Item</v-btn> <!-- Stays at the right -->
        
        </v-col>
      </v-row>
     
        <v-row justify="center">
        <v-col cols="12" md="6">
          <v-data-table
            :headers="headers"
            :items="items"
            hide-default-header
            class="elevation-1"
            caption="Asset Profiles"
          >
            <!-- Custom Header Slot -->
            <template v-slot:header="{ props: { headers } }">
              <thead>
                <tr>
                  <th v-for="header in headers" :key="header.text" :class="header.class">
                    <span>{{ header.text }}</span>
                  </th>
                </tr>
              </thead>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      
   
     </v-container>

     <!-- Checkout Checkout Dialog -->
    <v-dialog v-model="showCheckoutDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Check Out Item</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
              <v-radio-group v-model="inline" inline label="Choose Input Method">
                <v-radio label="Scan" value="scan"></v-radio>
                <v-radio label="Manual Entry" value="manualEntry"></v-radio>
              </v-radio-group>
            </v-col>
                <v-col cols="12">
                <v-text-field
                label="Serial Number"
                ></v-text-field>
                </v-col>
                <v-col cols="12">
                <v-select
                    label="Select person"
                ></v-select>
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
            </v-btn
          >
          <v-btn color="saveblue" @click="closeCheckoutDialog">Confirm Check Out</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
