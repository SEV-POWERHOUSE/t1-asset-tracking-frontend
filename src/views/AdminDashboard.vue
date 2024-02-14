<script setup></script>

<script setup>
// Import necessary components and data setup for v-data-table
import { ref } from "vue";

const headers = [
  { text: "Name", align: "start", sortable: false, value: "name" },
  { text: "Quantity", value: "quantity" },
  { text: "Category", value: "category" },
  // Defining headers
];

// Example items for the data table
const items = ref([
  { name: "Item 1", quantity: 10, category: "Category 1" },
  { name: "Item 2", quantity: 15, category: "Category 2" },
  { name: "Item 3", quantity: 13, category: "Category 1" },
  { name: "Item 4", quantity: 17, category: "Category 2" },
  { name: "Item 5", quantity: 18, category: "Category 1" },
  { name: "Item 6", quantity: 11, category: "Category 2" },
]);
</script>

<template>
  <div>
    <v-container>
      <v-card-title>Asset Profiles</v-card-title>
      <v-row>
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
  </div>
</template>



