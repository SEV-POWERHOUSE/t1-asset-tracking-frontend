<script setup>
import PersonServices from "../services/personServices";
import SerializedAssetServices from "../services/serializedAssetServices";
import PersonAssetServices from "../services/personAssetServices";

import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { format, parseISO, isBefore } from "date-fns";

const router = useRouter();
const message = ref("");
const people = ref([]);
const serializedAssets = ref([]);
const personAssets = ref([]);
const assetProfiles = ref([]);
const snackbar = ref(false);
const snackbarText = ref("");
const activitySortBy = ref([{ key: "mostRecentDate", order: "desc" }]);

// Retrieve People from Database
const retrievePeople = async () => {
  try {
    const response = await PersonServices.getAll();
    people.value = response.data.map((person) => ({
      title: person.fullNameWithId,
      key: person.personId,
      lName: person.lName,
      fullName: person.fullName,
      fullNameWithId: person.fullNameWithId,
      email: person.email,
      idNumber: person.idNumber,
      activeStatus: person.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading people:", error);
  }
};

// Retrieve SerializedAssets from Database
const retrieveSerializedAssets = async () => {
  try {
    const response = await SerializedAssetServices.getAll();
    serializedAssets.value = response.data.map((serializedAsset) => {
      const profile = assetProfiles.value.find(
        (t) => t.key === serializedAsset.profileId
      );
      return {
        ...serializedAsset,
        title: serializedAsset.serializedAssetName,
        profileName: profile ? profile.profileName : "Unknown Profile",
        key: serializedAsset.serializedAssetId,
        profileId: serializedAsset.profileId,
        checkoutStatus: serializedAsset.checkoutStatus,
      };
    });
  } catch (error) {
    console.error("Error loading serialized assets:", error);
    message.value = "Failed to load serializedAssets.";
  }
};

// Retrieve PersonAssets from Database
const retrievePersonAssets = async () => {
  try {
    // Mock fetching personAssets
    const response = await PersonAssetServices.getAll();
    // Simulate join logic
    personAssets.value = response.data.map((personAsset) => {
      const person = people.value.find((p) => p.key === personAsset.personId);
      const serializedAsset = serializedAssets.value.find(
        (sa) => sa.key === personAsset.serializedAssetId
      );

      return {
        personAssetId: personAsset.personAssetId,
        personId: personAsset.personId,
        serializedAssetId: personAsset.serializedAssetId,
        fullName: person ? person.fullName : "Unknown",
        title: serializedAsset
          ? serializedAsset.serializedAssetName
          : "Unknown Asset",
        checkoutDate: personAsset.checkoutDate,
        checkoutStatus: personAsset.checkoutStatus,
        expectedCheckinDate: personAsset.expectedCheckinDate,
        checkinDate: personAsset.checkinDate,
      };
    });
  } catch (error) {
    console.error("Error loading person assets:", error);
    message.value = "Failed to load person assets.";
  }
};

const personAssetHeaders = ref([
  { title: "Owner", key: "fullName" },
  { title: "Asset", key: "title" },
  { title: "Activity Type", key: "activityType" },
  { title: "Most Recent Date", key: "mostRecentDate" },
]);

const translateStatus = (status) => {
  return status ? "Checked Out" : "Checked In";
};

const formatDate = (dateString) => {
  if (!dateString) return "Indefinite"; // Return "Indefinite" if dateString is null or undefined
  // Extract just the date part to avoid time zone conversion issues
  const [year, month, day] = dateString.split("T")[0].split("-");
  // Format the date as MM-DD-YYYY
  const formattedDate = `${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}-${year}`;
  return formattedDate;
};

const combinedPersonAssets = computed(() => {
  return personAssets.value
    .map((asset) => {
      // Directly use the date strings for comparison
      let mostRecentDateStr = asset.checkoutDate; // Default to checkoutDate
      if (
        asset.checkinDate &&
        (!asset.checkoutDate || asset.checkinDate > asset.checkoutDate)
      ) {
        mostRecentDateStr = asset.checkinDate;
      }

      return {
        ...asset,
        // Format the mostRecentDate using formatDate function to ensure consistency
        mostRecentDate: formatDate(mostRecentDateStr),
        activityType:
          asset.checkinDate &&
          (!asset.checkoutDate || asset.checkinDate > asset.checkoutDate)
            ? "Check-In"
            : "Checkout",
      };
      // Since we're working with strings, we can sort them directly
    })
    .sort((a, b) => (a.mostRecentDate > b.mostRecentDate ? -1 : 1));
});

function goToCheckoutPage() {
  router.push({ name: "assetCheckout" });
}

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await retrievePeople();
  await retrieveSerializedAssets();
  await retrievePersonAssets();
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Admin Dashboard</v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Recent Activity</span>
              <v-btn color="saveblue" @click="goToCheckoutPage">
                Go To Checkout
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="personAssetHeaders"
                :items="combinedPersonAssets"
                class="elevation-1"
                :items-per-page="10"
                :items-per-page-options="[5, 10, 20, 50, -1]"
                v-model:sort-by="activitySortBy"
              >
                <template v-slot:item.activityType="{ item }">
                  <td>{{ item.activityType }}</td>
                </template>
                <template v-slot:item.mostRecentDate="{ item }">
                  <td>{{ item.mostRecentDate }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
