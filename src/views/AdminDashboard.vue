<script setup>
import SerializedAssetServices from "../services/serializedAssetServices";
import PersonServices from "../services/personServices";
import PersonAssetServices from "../services/personAssetServices";
import BuildingServices from "../services/buildingServices";
import BuildingAssetServices from "../services/buildingAssetServices";
import RoomServices from "../services/roomServices";
import RoomAssetServices from "../services/roomAssetServices";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { format, parseISO, isBefore } from "date-fns";

const router = useRouter();
const message = ref("");
const serializedAssets = ref([]);
const assetProfiles = ref([]);
const people = ref([]);
const personAssets = ref([]);
const buildings = ref([]);
const buildingAssets = ref([]);
const rooms = ref([]);
const roomAssets = ref([]);
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

// Retrieve Rooms from Database
const retrieveRooms = async () => {
  try {
    const response = await RoomServices.getAll();
    rooms.value = response.data.map((room) => ({
      title: room.roomName,
      key: room.roomId,
      roomNo: room.roomNo,
      buildingId: room.buildingId,
      activeStatus: room.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading rooms:", error);
  }
};

// Retrieve RoomAssets from Database
const retrieveRoomAssets = async () => {
  try {
    // Mock fetching roomAssets
    const response = await RoomAssetServices.getAll();
    // Simulate join logic
    roomAssets.value = response.data.map((roomAsset) => {
      const room = rooms.value.find((r) => r.key === roomAsset.roomId);
      const serializedAsset = serializedAssets.value.find(
        (ra) => ra.key === roomAsset.serializedAssetId
      );

      return {
        roomAssetId: roomAsset.roomAssetId,
        roomId: roomAsset.roomId,
        name: room ? room.title : "Unknown",
        serializedAssetId: roomAsset.serializedAssetId,
        title: serializedAsset
          ? serializedAsset.serializedAssetName
          : "Unknown Asset",
        checkoutDate: roomAsset.checkoutDate,
        checkoutStatus: roomAsset.checkoutStatus,
        expectedCheckinDate: roomAsset.expectedCheckinDate,
        checkinDate: roomAsset.checkinDate,
      };
    });
  } catch (error) {
    console.error("Error loading room assets:", error);
    message.value = "Failed to load room assets.";
  }
};

const activityHeaders = ref([
  { title: "Owner/Facility", key: "owner" },
  { title: "Asset", key: "assetTitle" },
  { title: "Asset Type", key: "assetType" },
  { title: "Activity Type", key: "activityType" },
  { title: "Most Recent Date", key: "mostRecentDate" },
]);

const combinedAssets = computed(() => {
  // Initialize an empty array to hold all activities
  const allActivities = [];

  // Process person assets for checkout and check-in
  personAssets.value.forEach((asset) => {
    const person = people.value.find((p) => p.key === asset.personId);
    const serializedAsset = serializedAssets.value.find(
      (sa) => sa.key === asset.serializedAssetId
    );
    const assetTitle = serializedAsset
      ? serializedAsset.serializedAssetName
      : "Unknown Asset";
    const fullName = person ? person.fullName : "Unknown";

    // Add checkout activity, if exists
    if (asset.checkoutDate) {
      allActivities.push({
        owner: fullName,
        assetTitle: assetTitle,
        activityType: "Checkout",
        mostRecentDate: asset.checkoutDate,
        assetType: "Person Asset",
      });
    }

    // Add check-in activity, if exists
    if (asset.checkinDate) {
      allActivities.push({
        owner: fullName,
        assetTitle: assetTitle,
        activityType: "Check-in",
        mostRecentDate: asset.checkinDate,
        assetType: "Person Asset",
      });
    }
  });

  // Process building assets for checkout and check-in
  buildingAssets.value.forEach((asset) => {
    const building = buildings.value.find((b) => b.key === asset.buildingId);
    const serializedAsset = serializedAssets.value.find(
      (sa) => sa.key === asset.serializedAssetId
    );
    const assetTitle = serializedAsset
      ? serializedAsset.serializedAssetName
      : "Unknown Asset";
    const buildingName = building ? building.title : "Unknown";

    if (asset.checkoutDate) {
      allActivities.push({
        owner: buildingName,
        assetTitle: assetTitle,
        activityType: "Checkout",
        mostRecentDate: asset.checkoutDate,
        assetType: "Building Asset",
      });
    }

    if (asset.checkinDate) {
      allActivities.push({
        owner: buildingName,
        assetTitle: assetTitle,
        activityType: "Check-in",
        mostRecentDate: asset.checkinDate,
        assetType: "Building Asset",
      });
    }
  });

  // Process room assets for checkout and check-in
  roomAssets.value.forEach((asset) => {
    const room = rooms.value.find((r) => r.key === asset.roomId);
    const serializedAsset = serializedAssets.value.find(
      (sa) => sa.key === asset.serializedAssetId
    );
    const assetTitle = serializedAsset
      ? serializedAsset.serializedAssetName
      : "Unknown Asset";
    const roomName = room ? room.title : "Unknown";

    if (asset.checkoutDate) {
      allActivities.push({
        owner: roomName,
        assetTitle: assetTitle,
        activityType: "Checkout",
        mostRecentDate: asset.checkoutDate,
        assetType: "Room Asset",
      });
    }

    if (asset.checkinDate) {
      allActivities.push({
        owner: roomName,
        assetTitle: assetTitle,
        activityType: "Check-in",
        mostRecentDate: asset.checkinDate,
        assetType: "Room Asset",
      });
    }
  });

  // After processing all assets, sort by mostRecentDate and format the date for display
  return allActivities
    .map((activity) => ({
      ...activity,
      mostRecentDateObj: parseISO(activity.mostRecentDate),
    }))
    .sort((a, b) => b.mostRecentDateObj - a.mostRecentDateObj)
    .map(({ mostRecentDateObj, ...activity }) => ({
      ...activity,
      mostRecentDate: format(mostRecentDateObj, "MMM dd, yyyy"),
    }));
});

function goToCheckoutPage() {
  router.push({ name: "assetCheckout" });
}

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await retrieveSerializedAssets();
  await retrievePeople();
  await retrievePersonAssets();
  await retrieveBuildings();
  await retrieveBuildingAssets();
  await retrieveRooms();
  await retrieveRoomAssets();
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
                :headers="activityHeaders"
                :items="combinedAssets"
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
