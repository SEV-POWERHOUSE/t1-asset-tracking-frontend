<script setup>
import PersonServices from "../services/personServices";
import SerializedAssetServices from "../services/serializedAssetServices";
import PersonAssetServices from "../services/personAssetServices";

import { ref, onMounted, watch, computed } from "vue";
import { format } from "date-fns";

const message = ref("");
const people = ref([]);
const serializedAssets = ref([]);
const personAssets = ref([]);
const assetProfiles = ref([]);
const validCheckout = ref(false);

const showCheckoutDialog = ref(false);
const validPersonAsset = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const activitySortBy = ref([{ key: "checkoutDate", order: "desc" }]);
const rules = {
  required: (value) => !!value || "Required.",
};
const newPersonAsset = ref({
  serializedAssetId: "",
  personId: "",
  checkoutDate: "",
});

// Retrieve People from Database
const retrievePeople = async () => {
  try {
    const response = await PersonServices.getAll();
    people.value = response.data.map((person) => ({
      title: person.fName,
      key: person.personId,
      lName: person.lName,
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
        fullName: person ? `${person.title} ${person.lName}` : "Unknown",
        assetName: serializedAsset
          ? serializedAsset.serializedAssetName
          : "Unknown Asset",
        checkoutDate: personAsset.checkoutDate,
      };
    });
  } catch (error) {
    console.error("Error loading person assets:", error);
    message.value = "Failed to load person assets.";
  }
};

const saveCheckout = async () => {
  if (newPersonAsset.value.personId && newPersonAsset.value.serializedAssetId) {
    // Use the current date without subtracting a day
    const formattedDate = format(new Date(), "yyyy-MM-dd");

    const personAssetData = {
      serializedAssetId: newPersonAsset.value.serializedAssetId.key,
      personId: newPersonAsset.value.personId.key,
      checkoutDate: formattedDate,
    };

    try {
      await PersonAssetServices.create(personAssetData);
      snackbarText.value = "Asset checked out successfully!";
      snackbar.value = true;

      closeCheckoutDialog();
      await retrievePersonAssets();
    } catch (error) {
      console.error("Error saving checkout:", error);
      snackbarText.value = "Failed to check out the asset.";
      snackbar.value = true;
    }
  } else {
    snackbarText.value = "Please select both a person and an asset.";
    snackbar.value = true;
  }
};

const closeCheckoutDialog = () => {
  showCheckoutDialog.value = false;
  newPersonAsset.value = {
    serializedAssetId: "",
    personId: "",
    checkoutDate: "",
  };
};

// Define headers for the data table
const personAssetHeaders = ref([
  { title: "Owner", key: "fullName" },
  { title: "Asset", key: "assetName" },
  { title: "Checkout Date", key: "checkoutDate" },
]);

const formatDate = (dateString) => {
  // Extract just the date part to avoid time zone conversion issues
  const [year, month, day] = dateString.split("T")[0].split("-");
  // Format the date as MM-DD-YYYY
  const formattedDate = `${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}-${year}`;
  return formattedDate;
};

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
            <v-toolbar-title>User Dashboard</v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Recent Activity</span>
              <v-btn color="saveblue" @click="showCheckoutDialog = true">
                Checkout
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="personAssetHeaders"
                :items="personAssets"
                class="elevation-1"
                :items-per-page="10"
                :items-per-page-options="[5, 10, 20, 50, -1]"
                v-model:sort-by="activitySortBy"
              >
                <template v-slot:item="{ item }">
                  <tr>
                    <td>{{ item.fullName }}</td>
                    <td>{{ item.assetName }}</td>
                    <td>{{ formatDate(item.checkoutDate) }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Checkout Dialog -->
      <v-dialog v-model="showCheckoutDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Checkout Asset</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-autocomplete
                    label="Select Person"
                    v-model="newPersonAsset.personId"
                    :items="people"
                    :item-text="(item) => `${item.title} ${item.lName}`"
                    item-value="key"
                    :rules="[rules.required]"
                    return-object
                    clearable
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-autocomplete
                    label="Select Asset"
                    v-model="newPersonAsset.serializedAssetId"
                    :items="serializedAssets"
                    item-text="title"
                    item-value="key"
                    :rules="[rules.required]"
                    return-object
                    clearable
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="cancelgrey" text @click="closeCheckoutDialog"
              >Cancel</v-btn
            >
            <v-btn color="saveblue" text @click="saveCheckout">Checkout</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
