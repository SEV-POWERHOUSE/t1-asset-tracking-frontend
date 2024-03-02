<script setup>
import BuildingServices from "../services/buildingServices";
import RoomServices from "../services/roomServices";
import { ref, onMounted, watch, computed } from "vue";

const message = ref("");
const selectedTab = ref("Buildings");
const selectedStatus = ref("Active");
const buildings = ref([]);
const rooms = ref([]);
const showAddBuildingDialog = ref(false);
const showAddRoomDialog = ref(false);
const editingBuilding = ref(false);
const editingRoom = ref(false);
const selectedBuildingId = ref("");
const validBuilding = ref(false);
const validRoom = ref(false);
const showDeleteConfirmDialog = ref(false);
const showArchiveDialog = ref(false);
const showActivateDialog = ref(false);
const itemToDelete = ref(null);
const itemToArchive = ref(null);
const itemToActivate = ref(null);
const snackbar = ref(false);
const snackbarText = ref("");
const rules = {
  required: (value) => !!value || "Required.",
  maxNameLength: (value) => value.length <= 80,
  roomNumber: (value) => /^[a-zA-Z0-9]{2,4}$/.test(value) || "Room number must be between 2 and 4 characters long.", 
  numberOfRooms: value => {
    const intValue = parseInt(value);
    return Number.isInteger(intValue) && intValue >= 0 && intValue <= 400 || "Number of rooms cannot be greater than 400"
  },
  buildingAbbreviation: value => {
            const pattern =
              /^[a-zA-Z]{2,3}$/
            return pattern.test(value) || 'Building Abbreviation must be 2 or 3 characters';
  }
};
const newBuilding = ref({
  title: "",
  abbreviation: "",
  noOfRooms: "",
});
const newRoom = ref({
  title: "",
  buildingId: "",
});

// Buildings Section

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
  console.log(buildings.value);
};

const editBuilding = async (building) => {
  newBuilding.value = {
    title: building.title,
    abbreviation: building.abbreviation,
    noOfRooms: building.noOfRooms,
    activeStatus: building.activeStatus,
    buildingId: building.key,
  };
  editingBuilding.value = true;
  showAddBuildingDialog.value = true;
};

const saveBuilding = async () => {
  const buildingData = {
    name: newBuilding.value.title,
    abbreviation: newBuilding.value.abbreviation,
    noOfRooms: newBuilding.value.noOfRooms,
  };

  try {
    let response;
    if (editingBuilding.value) {
      // Assuming your API expects an ID and the updated data for building updates
      response = await BuildingServices.update(
        newBuilding.value.buildingId,
        buildingData
      );
      snackbarText.value = "Building updated successfully.";
    } else {
      response = await BuildingServices.create(buildingData);
      snackbarText.value = "Building added successfully.";
    }
    snackbar.value = true; // Show the snackbar
    message.value = "Building saved successfully.";
    retrieveBuildings(); // Refresh buildings list
  } catch (error) {
    console.error("Error saving building:", error);
    message.value = `Error saving building: ${
      error.message || "Unknown error"
    }`;
  } finally {
    editingBuilding.value = false;
    showAddBuildingDialog.value = false;
    newBuilding.value = { title: "", abbreviation: "", noOfRooms: "" }; // Reset the form
  }
};

const deleteBuilding = async (buildingId) => {
  try {
    await BuildingServices.delete(buildingId);
    snackbarText.value = "Building deleted successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of buildings after successful deletion
    retrieveBuildings();
    buildings.value = buildings.value.filter(
      (t) => t.buildingId !== buildingId
    );
  } catch (error) {
    console.error(error);
    message.value = "Error deleting building.";
  }
};

const closeBuildingDialog = () => {
  showAddBuildingDialog.value = false;
  editingBuilding.value = false;
  newBuilding.value = { name: "", abbreviation: "", noOfRooms: "" };
};
const archiveBuilding = async (buildingId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await BuildingServices.update(buildingId, archiveData);
    snackbarText.value = "Building archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of buildings after successful deletion
    retrieveBuildings();
    buildings.value = buildings.value.filter((c) => c.id !== buildingId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving building.";
  }
};

const activateBuilding = async (buildingId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await BuildingServices.update(buildingId, activateData);
    snackbarText.value = "Building activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of buildings after successful deletion
    retrieveBuildings();
    buildings.value = buildings.value.filter((c) => c.id !== buildingId);
  } catch (error) {
    console.error(error);
    message.value = "Error activating building.";
  }
};

const buildingHeaders = ref([
  { title: "Building Name", key: "title" },
  { title: "Abbreviation", key: "abbreviation" },
  { title: "No. of Rooms", key: "noOfRooms" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const archivedBuildingHeaders = ref([
  { title: "Building Name", key: "title" },
  { title: "Abbreviation", key: "abbreviation" },
  { title: "No. of Rooms", key: "noOfRooms" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

const filteredBuildings = computed(() => {
  if (selectedStatus.value === "Active") {
    return buildings.value.filter(
      (buildings) => buildings.activeStatus === true
    );
  } else if (selectedStatus.value === "Archived") {
    return buildings.value.filter(
      (buildings) => buildings.activeStatus === false
    );
  } else {
    return buildings.value;
  }
});
// Rooms Section

// Retrieve Rooms from Database
const retrieveRooms = async () => {
  try {
    // Assuming you've already fetched buildings at this point
    const roomsResponse = await RoomServices.getAll();
    const enrichedRooms = roomsResponse.data.map((room) => {
      // Find the building for each type
      const building = buildings.value.find((c) => c.key === room.buildingId);
      return {
        ...room,
        buildingName: building ? building.title : "Unknown Building", // Enriching room with building name
        key: room.roomId, // Keeping your original key assignment
        title: room.roomNo, // Assuming you're mapping roomNo to roomNo
        buildingId: room.buildingId,
      };
    });
    rooms.value = enrichedRooms;
  } catch (error) {
    console.error("Error loading rooms:", error);
    message.value = "Failed to load rooms.";
  }
};

const editRoom = (room) => {
  selectedBuildingId.value = room.buildingId; // Assuming you have this ID correctly set
  newRoom.value = {
    title: room.title,
    buildingId: room.buildingId,
    roomId: room.roomId,
  };
  editingRoom.value = true;
  showAddRoomDialog.value = true;
};

const saveRoom = async () => {
  let buildingId = selectedBuildingId.value; // Directly use the selected category ID
  console.log(buildingId);

  if (!buildingId) {
    console.error("Building not selected.");
    message.value = "Building not found or not selected.";
    return;
  }

  // Prepare the room data for saving
  const roomData = {
    roomNo: newRoom.value.title,
    buildingId: selectedBuildingId.value, // Make sure this is getting set correctly
  };

  try {
    if (editingRoom.value) {
      console.log(newRoom.value.roomId);
      await RoomServices.update(newRoom.value.roomId, roomData);
      snackbarText.value = "Room updated successfully.";
    } else {
      await RoomServices.create(roomData);
      snackbarText.value = "Room added successfully.";
      console.log(roomData);
    }
    snackbar.value = true; // Show the snackbar
    message.value = "Room saved successfully.";
    await retrieveRooms();
  } catch (error) {
    console.error("Error saving room:", error);
    message.value = `Error saving room: ${error.message || "Unknown error"}`;
  } finally {
    resetForm(); // Ensure form is reset here
    showAddRoomDialog.value = false; // Close dialog in finally to ensure it closes
  }
  console.log(roomData);
};

const deleteRoom = async (roomId) => {
  try {
    await RoomServices.delete(roomId);
    snackbarText.value = "Room deleted successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of rooms after successful deletion
    retrieveRooms();
    rooms.value = rooms.value.filter((t) => t.id !== roomId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting room.";
  }
};

const resetForm = () => {
  newRoom.value = { roomNo: "", buildingId: "", id: null }; // Explicitly set `id` to `null`
  selectedBuildingId.value = "";
  validRoom.value = false;
  validBuilding.value = false;
  editingRoom.value = false; // Explicitly reset editing flag
};

const closeRoomDialog = () => {
  resetForm(); // Resets form when closing or canceling the dialog
  showAddRoomDialog.value = false;
};

const openAddRoomDialog = () => {
  resetForm(); // Ensure form is reset when dialog is opened
  showAddRoomDialog.value = true;
};

const archiveRoom = async (roomId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await RoomServices.update(roomId, archiveData);
    snackbarText.value = "Room archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of rooms after successful deletion
    retrieveRooms();
    rooms.value = rooms.value.filter((c) => c.id !== roomId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving room.";
  }
};

const activateRoom = async (roomId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await RoomServices.update(roomId, activateData);
    snackbarText.value = "Room activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of Rooms after successful deletion
    retrieveRooms();
    rooms.value = rooms.value.filter((c) => c.id !== roomId);
  } catch (error) {
    console.error(error);
    message.value = "Error activating room.";
  }
};

const roomHeaders = ref([
  { title: "Room No.", key: "title" },
  { title: "Building", key: "buildingName" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const archivedRoomHeaders = ref([
  { title: "Room No.", key: "title" },
  { title: "Building", key: "buildingName" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

const filteredRooms = computed(() => {
  if (selectedStatus.value === "Active") {
    return rooms.value.filter((rooms) => rooms.activeStatus === true);
  } else if (selectedStatus.value === "Archived") {
    return rooms.value.filter((rooms) => rooms.activeStatus === false);
  } else {
    return rooms.value;
  }
});

// Misc Section
const openDeleteConfirmDialog = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value.type === "building") {
    await deleteBuilding(itemToDelete.value.id);
  } else if (itemToDelete.value.type === "room") {
    await deleteRoom(itemToDelete.value.id);
  }
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

const openArchiveDialog = (item) => {
  itemToArchive.value = item;
  showArchiveDialog.value = true;
};

const confirmArchive = async () => {
  if (itemToArchive.value.type === "building") {
    await archiveBuilding(itemToArchive.value.id);
  } else if (itemToArchive.value.type === "room") {
    await archiveRoom(itemToArchive.value.id);
  }
  showArchiveDialog.value = false;
  itemToArchive.value = null; // Reset after deletion
};

const openActivateDialog = (item) => {
  itemToActivate.value = item;
  showActivateDialog.value = true;
};

const confirmActivate = async () => {
  if (itemToActivate.value.type === "building") {
    await activateBuilding(itemToActivate.value.id);
  } else if (itemToActivate.value.type === "room") {
    await activateRoom(itemToActivate.value.id);
  }
  showActivateDialog.value = false;
  itemToActivate.value = null; // Reset after deletion
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Buildings") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveBuildings();
      } else if (statusValue === "Archived") {
        //retrieveInactiveAssetCategories();
      }
    });
  } else if (newValue === "Rooms") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveBuildings();
        retrieveRooms();
      } else if (statusValue === "Archived") {
        //retrieveInactiveAssetCategories();
        //retrieveInactiveAssetTypes();
      }
    });
  }
});
// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await retrieveBuildings();
  await retrieveRooms();
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Facility Management</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="Buildings" color="primary">Buildings</v-tab>
            <v-tab value="Rooms" color="primary">Rooms</v-tab>
          </v-tabs>
          <v-tabs v-model="selectedStatus" background-color="primary" dark>
            <v-tab value="Active" color="primary">Active</v-tab>
            <v-tab value="Archived" color="primary">Archived</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Active Buildings Section -->
            <div
              v-if="selectedTab === 'Buildings' && selectedStatus === 'Active'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Buildings</span>
                  <v-btn color="primary" @click="showAddBuildingDialog = true">
                    Add New Building
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="buildingHeaders"
                    :items="filteredBuildings"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editBuilding(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'building',
                          })
                        "
                      >
                        <v-icon>mdi-arrow-down-box</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- Archived Buildings Section -->
            <div
              v-if="
                selectedTab === 'Buildings' && selectedStatus === 'Archived'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Archived Buildings</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="archivedBuildingHeaders"
                    :items="filteredBuildings"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editBuilding(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'building',
                          })
                        "
                      >
                        <v-icon>mdi-arrow-up-box</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.delete="{ item }">
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.key,
                            type: 'building',
                          })
                        "
                      >
                        <v-icon color="primary">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- Active rooms Section -->
            <div v-if="selectedTab === 'Rooms' && selectedStatus === 'Active'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Rooms</span>
                  <v-btn color="primary" @click="openAddRoomDialog">
                    Add New Room
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="roomHeaders"
                    :items="filteredRooms"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >

                  <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editRoom(item)">

                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'room',
                          })
                        "
                      >
                        <v-icon>mdi-arrow-down-box</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>
            <!-- Archived rooms Section -->
            <div
              v-if="selectedTab === 'Rooms' && selectedStatus === 'Archived'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Rooms</span>
                  <v-btn color="primary" @click="openAddRoomDialog">
                    Add New Room
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="archivedRoomHeaders"
                    :items="filteredRooms"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editRoom(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'room',
                          })
                        "
                      >
                        <v-icon>mdi-arrow-up-box</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.delete="{ item }">
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.key,
                            type: 'room',
                          })
                        "
                      >
                        <v-icon color="primary">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>
          </v-fade-transition>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add/Edit Building Dialog -->
    <v-dialog v-model="showAddBuildingDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ editingBuilding ? "Edit" : "Add" }} Building</span
          >
        </v-card-title>
        <v-card-text>
          <v-form ref="formBuilding" v-model="validBuilding">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Building Name"
                    v-model="newBuilding.title"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="80"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Building abbreviation"
                    v-model="newBuilding.abbreviation"
                    :rules="[rules.required, rules.buildingAbbreviation]"
                    maxlength="3"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="No. of Rooms"
                    v-model="newBuilding.noOfRooms"
                    :rules="[rules.required, rules.numberOfRooms]"
                    maxlength="3"
                    counter
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeBuildingDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="saveblue"
            @click="saveBuilding(newBuilding)"
            :disabled="!validBuilding"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Room Dialog -->
    <v-dialog v-model="showAddRoomDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingRoom ? "Edit" : "Add" }} Room</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRoom" v-model="validRoom">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Room No"
                    v-model="newRoom.title"
                    maxlength="4"
                    :rules="[rules.required, rules.roomNumber]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Building Selection -->
                  <v-select
                    label="Building"
                    :items="buildings"
                    v-model="selectedBuildingId"
                    item-text="title"
                    item-value="key"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Use the validRoom model to control the disabled state -->
          <v-btn color="cancelgrey" text @click="closeRoomDialog">Cancel</v-btn>
          <v-btn color="saveblue" @click="saveRoom" :disabled="!validRoom"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteConfirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete this item?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="cancelgrey"
            text
            @click="showDeleteConfirmDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteConfirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete this item?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="cancelgrey"
            text
            @click="showDeleteConfirmDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Confirm Archive Dialog -->
    <v-dialog v-model="showArchiveDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Archive</v-card-title>
        <v-card-text>Are you sure you want to archive this item? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="showArchiveDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="confirmArchive">Archive</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Confirm Activate Dialog -->
    <v-dialog v-model="showActivateDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Activate</v-card-title>
        <v-card-text>Are you sure you want to activate this item? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="showActivateDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" text @click="confirmActivate">Activate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
      <!-- <v-btn color="pink" text @click="snackbar = false">Close</v-btn> -->
    </v-snackbar>
  </div>
</template>
