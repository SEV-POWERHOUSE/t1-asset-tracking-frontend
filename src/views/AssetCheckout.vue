Here is my current code:

<script setup>
import SerializedAssetServices from "../services/serializedAssetServices";
import PersonServices from "../services/personServices";
import PersonAssetServices from "../services/personAssetServices";
import BuildingServices from "../services/buildingServices";
import BuildingAssetServices from "../services/buildingAssetServices";
import RoomServices from "../services/roomServices";
import RoomAssetServices from "../services/roomAssetServices";
import { ref, onMounted, watch, computed } from "vue";
import { parseISO, format } from "date-fns";

const message = ref("");
const selectedTab = ref("SerializedAssets");
const selectedStatus = ref("Checkout");
const selectedPersonAsset = ref("");
const selectedBuildingAsset = ref("");
const serializedAssets = ref([]);
const assetProfiles = ref([]);
const people = ref([]);
const personAssets = ref([]);
const buildings = ref([]);
const buildingAssets = ref([]);
const rooms = ref([]);
const roomAssets = ref([]);
const validPersonAsset = ref(false);
const validBuildingAsset = ref(false);
const validRoomAsset = ref(false);
const showPersonCheckoutDialog = ref(false);
const showPersonCheckinDialog = ref(false);
const showBuildingCheckoutDialog = ref(false);
const showBuildingCheckinDialog = ref(false);
const menu = ref(false);
const indefiniteCheckout = ref(true);
const expectedCheckinDate = ref(null);
const snackbar = ref(false);
const snackbarText = ref("");
const checkoutSortBy = ref([{ key: "checkoutDate", order: "desc" }]);
const checkinSortBy = ref([{ key: "checkinDate", order: "desc" }]);
const rules = {
  required: (value) => !!value || "Required.",
};
const newPersonAsset = ref({
  serializedAssetId: "",
  personId: "",
  checkoutDate: "",
  checkoutStatus: "",
  expectedCheckinDate: "",
});
const newBuildingAsset = ref({
  serializedAssetId: "",
  buildingId: "",
  checkoutDate: "",
  checkoutStatus: "",
  expectedCheckinDate: "",
});
const newRoomAsset = ref({
  serializedAssetId: "",
  roomId: "",
  checkoutDate: "",
  checkoutStatus: "",
  expectedCheckinDate: "",
});

// *** People Section ***

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

const savePersonCheckout = async () => {
  if (newPersonAsset.value.personId && newPersonAsset.value.serializedAssetId) {
    const formattedDate = format(new Date(), "MMM dd, yyyy HH:mm:ss");

    // Check if the checkin is marked as indefinite
    let checkinDate = null; // Default to null for indefinite checkin
    if (!indefiniteCheckout.value && expectedCheckinDate.value) {
      // Format the expected checkin date for database
      checkinDate = format(
        new Date(expectedCheckinDate.value),
        "MMM dd, yyyy HH:mm:ss"
      );
    }

    const personAssetData = {
      serializedAssetId: newPersonAsset.value.serializedAssetId.key,
      personId: newPersonAsset.value.personId.key,
      checkoutDate: formattedDate,
      checkoutStatus: true,
      expectedCheckinDate: checkinDate,
    };

    try {
      // Create new PersonAsset record
      await PersonAssetServices.create(personAssetData);

      // Update the checkoutStatus of the SerializedAsset to true
      await SerializedAssetServices.updateCheckoutStatus(
        newPersonAsset.value.serializedAssetId.key,
        true
      );

      snackbarText.value = "Asset checked out successfully!";
      snackbar.value = true;

      closePersonCheckoutDialog();
      await retrievePersonAssets();
      await retrieveSerializedAssets(); // Refresh serialized assets to reflect the checkout status update
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

const savePersonCheckin = async () => {
  if (newPersonAsset.value.personAssetId) {
    try {
      const formattedDate = format(new Date(), "MMM dd, yyyy HH:mm:ss"); // Format the current date

      const selectedPersonAsset = personAssets.value.find(
        (pa) => pa.personAssetId === newPersonAsset.value.personAssetId
      );
      if (!selectedPersonAsset) {
        throw new Error("Selected asset not found.");
      }

      // Update the checkout status for both the PersonAsset and the SerializedAsset
      await PersonAssetServices.updateCheckoutStatusAndDate(
        selectedPersonAsset.personAssetId,
        false,
        formattedDate
      );
      await SerializedAssetServices.updateCheckoutStatus(
        selectedPersonAsset.serializedAssetId,
        false
      );

      snackbarText.value = "Asset checked in successfully!";
      snackbar.value = true;
      closePersonCheckinDialog();
      await retrievePersonAssets();
      await retrieveSerializedAssets(); // Refresh to show updated statuses
    } catch (error) {
      console.error("Error saving check-in:", error);
      snackbarText.value = "Failed to check in the asset.";
      snackbar.value = true;
    }
  } else {
    snackbarText.value = "Please select an asset for check-in.";
    snackbar.value = true;
  }
};

// const peopleWithCheckedOutAssets = computed(() => {
//   const checkedOutPersonIds = new Set(
//     personAssets.value
//       .filter((asset) => asset.checkoutStatus === true)
//       .map((asset) => asset.personId)
//   ); // Assuming personId exists in the asset object

//   return people.value.filter((person) => checkedOutPersonIds.has(person.key));
// });

const filteredPersonAssets = computed(() => {
  if (selectedStatus.value === "Checkout") {
    return personAssets.value.filter((asset) => asset.checkoutStatus === true);
  } else if (selectedStatus.value === "Check-in") {
    return personAssets.value.filter((asset) => asset.checkoutStatus === false);
  }
  return personAssets.value;
});

const closePersonCheckoutDialog = () => {
  showPersonCheckoutDialog.value = false;
  resetFields();
  newPersonAsset.value = {
    serializedAssetId: "",
    personId: "",
    checkoutDate: "",
    expectedCheckinDate: null,
  };
};

const closePersonCheckinDialog = () => {
  showPersonCheckinDialog.value = false;
  resetFields();
  // Reset the newPersonAsset values as well
  newPersonAsset.value = {
    serializedAssetId: "",
    personId: "",
    checkoutDate: "",
    checkoutStatus: "",
  };
  selectedPersonAsset.value = "";
};

// Define headers for the data table
const personAssetCheckoutHeaders = ref([
  { title: "Owner", key: "fullName" },
  { title: "Asset", key: "title" },
  { title: "Status", key: "checkoutStatus" },
  { title: "Expected Check-in Date", key: "expectedCheckinDate" },
  { title: "Checkout Date", key: "checkoutDate" },
]);

// Define headers for the data table
const personAssetCheckinHeaders = ref([
  { title: "Owner", key: "fullName" },
  { title: "Asset", key: "title" },
  { title: "Status", key: "checkoutStatus" },
  { title: "Expected Check-in Date", key: "expectedCheckinDate" },
  { title: "Check-in Date", key: "checkinDate" },
]);

// Computed property for assets available for checkout (checkoutStatus = false)
const availableForCheckoutPersonAssets = computed(() => {
  return serializedAssets.value.filter((asset) => !asset.checkoutStatus);
});

// Computed property for assets available for check-in (checkoutStatus = true)
const availableForCheckinPersonAssets = computed(() => {
  return personAssets.value.filter((asset) => asset.checkoutStatus);
});
//
//
//
//
//
//
// *** Buildings Section ***

// Retrieve Buildings from Database
const retrieveBuildings = async () => {
  try {
    const response = await BuildingServices.getAll();
    buildings.value = response.data.map((building) => ({
      title: building.name,
      key: building.buildingId,
      abbreviation: building.abbreviation,
      noOfRooms: building.noOfRooms,
      activeStatus: building.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading buildings:", error);
  }
};

// Retrieve BuildingAssets from Database
const retrieveBuildingAssets = async () => {
  try {
    // Mock fetching buildingAssets
    const response = await BuildingAssetServices.getAll();
    // Simulate join logic
    buildingAssets.value = response.data.map((buildingAsset) => {
      const building = buildings.value.find(
        (b) => b.key === buildingAsset.buildingId
      );
      const serializedAsset = serializedAssets.value.find(
        (ba) => ba.key === buildingAsset.serializedAssetId
      );

      return {
        buildingAssetId: buildingAsset.buildingAssetId,
        buildingId: buildingAsset.buildingId,
        serializedAssetId: buildingAsset.serializedAssetId,
        name: building ? building.title : "Unknown",
        title: serializedAsset
          ? serializedAsset.serializedAssetName
          : "Unknown Asset",
        checkoutDate: buildingAsset.checkoutDate,
        checkoutStatus: buildingAsset.checkoutStatus,
        expectedCheckinDate: buildingAsset.expectedCheckinDate,
        checkinDate: buildingAsset.checkinDate,
      };
    });
  } catch (error) {
    console.error("Error loading building assets:", error);
    message.value = "Failed to load building assets.";
  }
};

const saveBuildingCheckout = async () => {
  if (
    newBuildingAsset.value.buildingId &&
    newBuildingAsset.value.serializedAssetId
  ) {
    const formattedDate = format(new Date(), "MMM dd, yyyy HH:mm:ss");

    // Check if the checkin is marked as indefinite
    let checkinDate = null; // Default to null for indefinite checkin
    if (!indefiniteCheckout.value && expectedCheckinDate.value) {
      // Format the expected checkin date for database
      checkinDate = format(
        new Date(expectedCheckinDate.value),
        "MMM dd, yyyy HH:mm:ss"
      );
    }

    const buildingAssetData = {
      serializedAssetId: newBuildingAsset.value.serializedAssetId.key,
      buildingId: newBuildingAsset.value.buildingId.key,
      checkoutDate: formattedDate,
      checkoutStatus: true,
      expectedCheckinDate: checkinDate,
    };

    try {
      // Create new BuildingAsset record
      await BuildingAssetServices.create(buildingAssetData);

      // Update the checkoutStatus of the SerializedAsset to true
      await SerializedAssetServices.updateCheckoutStatus(
        newBuildingAsset.value.serializedAssetId.key,
        true
      );

      snackbarText.value = "Asset checked out successfully!";
      snackbar.value = true;

      closeBuildingCheckoutDialog();
      await retrieveBuildingAssets();
      await retrieveSerializedAssets(); // Refresh serialized assets to reflect the checkout status update
    } catch (error) {
      console.error("Error saving checkout:", error);
      snackbarText.value = "Failed to check out the asset.";
      snackbar.value = true;
    }
  } else {
    snackbarText.value = "Please select both a building and an asset.";
    snackbar.value = true;
  }
};

const saveBuildingCheckin = async () => {
  if (newBuildingAsset.value.buildingAssetId) {
    try {
      const formattedDate = format(new Date(), "MMM dd, yyyy HH:mm:ss"); // Format the current date

      const selectedBuildingAsset = buildingAssets.value.find(
        (ba) => ba.buildingAssetId === newBuildingAsset.value.buildingAssetId
      );
      if (!selectedBuildingAsset) {
        throw new Error("Selected asset not found.");
      }

      // Update the checkout status for both the BuildingAsset and the SerializedAsset
      await BuildingAssetServices.updateCheckoutStatusAndDate(
        selectedBuildingAsset.buildingAssetId,
        false,
        formattedDate
      );
      await SerializedAssetServices.updateCheckoutStatus(
        selectedBuildingAsset.serializedAssetId,
        false
      );

      snackbarText.value = "Asset checked in successfully!";
      snackbar.value = true;
      closeBuildingCheckinDialog();
      await retrieveBuildingAssets();
      await retrieveSerializedAssets(); // Refresh to show updated statuses
    } catch (error) {
      console.error("Error saving check-in:", error);
      snackbarText.value = "Failed to check in the asset.";
      snackbar.value = true;
    }
  } else {
    snackbarText.value = "Please select an asset for check-in.";
    snackbar.value = true;
  }
};

const filteredBuildingAssets = computed(() => {
  if (selectedStatus.value === "Checkout") {
    return buildingAssets.value.filter(
      (asset) => asset.checkoutStatus === true
    );
  } else if (selectedStatus.value === "Check-in") {
    return buildingAssets.value.filter(
      (asset) => asset.checkoutStatus === false
    );
  }
  return buildingAssets.value;
});

const closeBuildingCheckoutDialog = () => {
  showBuildingCheckoutDialog.value = false;
  resetFields();
  newBuildingAsset.value = {
    serializedAssetId: "",
    buildingId: "",
    checkoutDate: "",
    expectedCheckinDate: null,
  };
};

const closeBuildingCheckinDialog = () => {
  showBuildingCheckinDialog.value = false;
  resetFields();
  // Reset the newBuildingAsset values as well
  newBuildingAsset.value = {
    serializedAssetId: "",
    buildingId: "",
    checkoutDate: "",
    checkoutStatus: "",
  };
  selectedBuildingAsset.value = "";
};

// Define headers for the data table
const buildingAssetCheckoutHeaders = ref([
  { title: "Owner", key: "name" },
  { title: "Asset", key: "title" },
  { title: "Status", key: "checkoutStatus" },
  { title: "Expected Check-in Date", key: "expectedCheckinDate" },
  { title: "Checkout Date", key: "checkoutDate" },
]);

// Define headers for the data table
const buildingAssetCheckinHeaders = ref([
  { title: "Owner", key: "name" },
  { title: "Asset", key: "title" },
  { title: "Status", key: "checkoutStatus" },
  { title: "Expected Check-in Date", key: "expectedCheckinDate" },
  { title: "Check-in Date", key: "checkinDate" },
]);

// Computed property for assets available for checkout (checkoutStatus = false)
const availableForCheckoutBuildingAssets = computed(() => {
  return serializedAssets.value.filter((asset) => !asset.checkoutStatus);
});

// Computed property for assets available for check-in (checkoutStatus = true)
const availableForCheckinBuildingAssets = computed(() => {
  return buildingAssets.value.filter((asset) => asset.checkoutStatus);
});
//
//
//
//
//
//
// *** Misc Section ***

// Retrieve SerializedAssets from Database
const retrieveSerializedAssets = async () => {
  try {
    const response = await SerializedAssetServices.getAll();
    serializedAssets.value = response.data
      .filter((asset) => asset.activeStatus !== false) // Filter out archived assets
      .map((serializedAsset) => {
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

const translateStatus = (status) => {
  return status ? "Checked Out" : "Checked In";
};

const formatDate = (dateString) => {
  if (!dateString) return "Indefinite"; // Return "Indefinite" if dateString is null or undefined
  // Parse the dateString to a Date object
  const date = parseISO(dateString);
  // Format the date as "MMM dd, yyyy"
  return format(date, "MMM dd, yyyy");
};

// Computed property for display
const formattedCheckinDate = computed(() => {
  if (expectedCheckinDate.value) {
    return format(new Date(expectedCheckinDate.value), "MMM dd, yyyy");
  }
  return "";
});

const resetFields = () => {
  expectedCheckinDate.value = null; // or a default date if you prefer
  indefiniteCheckout.value = true; // Assuming true is the default state
  // Reset other fields as necessary
};

// Watchers

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "People") {
    watch(selectedStatus, (statusValue) => {
      retrieveSerializedAssets();
      retrievePeople();
      retrievePersonAssets();
    });
  } else if (newValue === "Buildings") {
    watch(selectedStatus, (statusValue) => {
      retrieveSerializedAssets();
      retrieveBuildings();
      retrieveBuildingAssets();
    });
  } else if (newValue === "Rooms") {
    watch(selectedStatus, (statusValue) => {
      retrieveSerializedAssets();
      // retrieveRooms();
      // retrieveRoomAssets();
    });
  }
});

// Watcher for checkin dialog v-auto
watch(
  selectedPersonAsset,
  (newValue) => {
    // Check if newValue is not null before trying to access its properties
    if (newValue && newValue.personAssetId) {
      newPersonAsset.value.personAssetId = newValue.personAssetId;
    } else {
      // If newValue is null, reset newPersonAsset.value.personAssetId to a default value
      newPersonAsset.value.personAssetId = "";
    }
  },
  { immediate: true, deep: true }
);

watch(
  selectedBuildingAsset,
  (newValue) => {
    // Check if newValue is not null before trying to access its properties
    if (newValue && newValue.buildingAssetId) {
      newBuildingAsset.value.buildingAssetId = newValue.buildingAssetId;
    } else {
      // If newValue is null, reset newBuildingAsset.value.buildingAssetId to a default value
      newBuildingAsset.value.buildingAssetId = "";
    }
  },
  { immediate: true, deep: true }
);

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await retrieveSerializedAssets();
  await retrievePeople();
  await retrievePersonAssets();
  await retrieveBuildings();
  await retrieveBuildingAssets();
  // await retrieveRooms();
  // await retrieveRoomAssets();
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Asset Checkout</v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="People" color="primary">People</v-tab>
            <v-tab value="Buildings" color="primary">Buildings</v-tab>
            <v-tab value="Rooms" color="primary">Rooms</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <!-- Introducing a spacer row for visual separation -->
      <v-row class="my-1"></v-row>
      <!-- Adjust 'my-1' class for desired spacing -->

      <v-row>
        <v-col cols="12">
          <v-tabs v-model="selectedStatus" background-color="primary" dark>
            <v-tab value="Checkout" color="primary">Checkout</v-tab>
            <v-tab value="Check-in" color="primary">Check-in</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- *** People Checkout Section *** -->
            <div
              v-if="selectedTab === 'People' && selectedStatus === 'Checkout'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Person Checkouts</span>
                  <v-btn
                    color="saveblue"
                    @click="showPersonCheckoutDialog = true"
                  >
                    Checkout
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personAssetCheckoutHeaders"
                    :items="filteredPersonAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkoutSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkoutDate="{ item }">
                      <td>{{ formatDate(item.checkoutDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- *** People Check-in Section *** -->
            <div
              v-if="selectedTab === 'People' && selectedStatus === 'Check-in'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Person Check-ins</span>
                  <v-btn
                    color="saveblue"
                    @click="showPersonCheckinDialog = true"
                  >
                    Check-in
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personAssetCheckinHeaders"
                    :items="filteredPersonAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkinSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkinDate="{ item }">
                      <td>{{ formatDate(item.checkinDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- *** Buildings Checkout Section *** -->
            <div
              v-if="
                selectedTab === 'Buildings' && selectedStatus === 'Checkout'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Building Checkouts</span>
                  <v-btn
                    color="saveblue"
                    @click="showBuildingCheckoutDialog = true"
                  >
                    Checkout
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="buildingAssetCheckoutHeaders"
                    :items="filteredBuildingAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkoutSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkoutDate="{ item }">
                      <td>{{ formatDate(item.checkoutDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- *** Buildings Check-in Section *** -->
            <div
              v-if="
                selectedTab === 'Buildings' && selectedStatus === 'Check-in'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Building Check-ins</span>
                  <v-btn
                    color="saveblue"
                    @click="showBuildingCheckinDialog = true"
                  >
                    Check-in
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="buildingAssetCheckinHeaders"
                    :items="filteredBuildingAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkinSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkinDate="{ item }">
                      <td>{{ formatDate(item.checkinDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- *** Rooms Checkout Section *** -->
            <div
              v-if="selectedTab === 'Rooms' && selectedStatus === 'Checkout'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Room Checkouts</span>
                  <v-btn
                    color="saveblue"
                    @click="showPersonCheckoutDialog = true"
                  >
                    Checkout
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personAssetCheckoutHeaders"
                    :items="filteredPersonAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkoutSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkoutDate="{ item }">
                      <td>{{ formatDate(item.checkoutDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- *** Rooms Check-in Section *** -->
            <div
              v-if="selectedTab === 'Rooms' && selectedStatus === 'Check-in'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Recent Room Check-ins</span>
                  <v-btn
                    color="saveblue"
                    @click="showPersonCheckinDialog = true"
                  >
                    Check-in
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personAssetCheckinHeaders"
                    :items="filteredPersonAssets"
                    class="elevation-1"
                    :items-per-page="10"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="checkinSortBy"
                  >
                    <template v-slot:item.checkoutStatus="{ item }">
                      <td>{{ translateStatus(item.checkoutStatus) }}</td>
                    </template>
                    <template v-slot:item.expectedCheckinDate="{ item }">
                      <td>{{ formatDate(item.expectedCheckinDate) }}</td>
                    </template>
                    <template v-slot:item.checkinDate="{ item }">
                      <td>{{ formatDate(item.checkinDate) }}</td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>
          </v-fade-transition>
        </v-col>
      </v-row>
    </v-container>

    <!-- *** Person Checkout Dialog *** -->
    <v-dialog v-model="showPersonCheckoutDialog" persistent max-width="600px">
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
                  item-text="title"
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
                  :items="availableForCheckoutPersonAssets"
                  item-text="title"
                  item-value="key"
                  :rules="[rules.required]"
                  return-object
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="indefiniteCheckout"
                  label="Indefinite Checkout"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" v-if="!indefiniteCheckout">
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedCheckinDate"
                      label="Expected Checkin Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      @click="menu = !menu"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="expectedCheckinDate"
                    @input="menu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closePersonCheckoutDialog"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="savePersonCheckout"
            >Checkout</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- *** Person Checkin Dialog *** -->
    <v-dialog v-model="showPersonCheckinDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Check-in Asset</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <!-- <v-autocomplete
                  label="Select Person"
                  v-model="newPersonAsset.personId"
                  :items="peopleWithCheckedOutAssets"
                  item-text="title"
                  item-value="key"
                  :rules="[rules.required]"
                  return-object
                  clearable
                ></v-autocomplete> -->
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  label="Select Asset for Check-in"
                  v-model="selectedPersonAsset"
                  :items="availableForCheckinPersonAssets"
                  item-text="title"
                  item-value="personAssetId"
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
          <v-btn color="cancelgrey" text @click="closePersonCheckinDialog"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="savePersonCheckin"
            >Check-in</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- *** Building Checkout Dialog *** -->
    <v-dialog v-model="showBuildingCheckoutDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Checkout Asset</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  label="Select Building"
                  v-model="newBuildingAsset.buildingId"
                  :items="buildings"
                  item-text="title"
                  item-value="key"
                  :rules="[rules.required]"
                  return-object
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  label="Select Asset"
                  v-model="newBuildingAsset.serializedAssetId"
                  :items="availableForCheckoutBuildingAssets"
                  item-text="title"
                  item-value="key"
                  :rules="[rules.required]"
                  return-object
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="indefiniteCheckout"
                  label="Indefinite Checkout"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" v-if="!indefiniteCheckout">
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedCheckinDate"
                      label="Expected Checkin Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      @click="menu = !menu"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="expectedCheckinDate"
                    @input="menu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeBuildingCheckoutDialog"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="saveBuildingCheckout"
            >Checkout</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- *** Building Checkin Dialog *** -->
    <v-dialog v-model="showBuildingCheckinDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Check-in Asset</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <!-- <v-autocomplete
                  label="Select Building"
                  v-model="newBuildingAsset.buildingId"
                  :items="buildingsWithCheckedOutAssets"
                  item-text="title"
                  item-value="key"
                  :rules="[rules.required]"
                  return-object
                  clearable
                ></v-autocomplete> -->
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  label="Select Asset for Check-in"
                  v-model="selectedBuildingAsset"
                  :items="availableForCheckinBuildingAssets"
                  item-text="title"
                  item-value="buildingAssetId"
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
          <v-btn color="cancelgrey" text @click="closeBuildingCheckinDialog"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="saveBuildingCheckin"
            >Check-in</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
