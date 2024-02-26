<script setup>
import BuildingServices from "../services/buildingServices";
import RoomServices from "../services/roomServices";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Buildings");
const buildings = ref([]);
const rooms = ref([]);
const showAddBuildingDialog = ref(false);
const showAddRoomDialog = ref(false);
const editingBuilding = ref(false);
const editingRoom= ref(false);
const selectedBuildingId = ref("");
const validBuilding = ref(false);
const validRoom= ref(false);
const showDeleteConfirmDialog = ref(false);
const itemToDelete = ref(null);
const rules = {
  required: (value) => !!value || "Required.",
};

const newBuilding = ref({
  title: '',
  abbreviation: '',
  noOfRooms: '',
});
const newRoom = ref({
  title: '',
  buildingId: '',
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
      noOfRooms: building.noOfRooms
    }));
  } catch (error) {
    console.error("Error loading buildings:", error);
  }
  console.log(buildings.value)
};


const editBuilding = async (building) => {
  newBuilding.value = {
    title: building.title,
    abbreviation: building.abbreviation,
    noOfRooms: building.title,
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
    } else {
      response = await BuildingServices.create(buildingData);
    }
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
    // Refresh the list of buildings after successful deletion
    retrieveBuildings();
    buildings.value = buildings.value.filter(
      (t) => t.buildingId !== buildingId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting building.";
  }
};

const closeBuildingDialog = () => {
  showAddBuildingDialog.value = false;
  editingBuilding.value = false;
  newBuilding.value = { name: "", abbreviation: '', noOfRooms: "" };
};

const buildingHeaders = ref([
  { title: "Building Name", key: "title" },
  { title: "Abbreviation", key: "abbreviation", sortable: false },
  { title: "No. of Rooms", key: "noOfRooms", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
]);

// Rooms Section

// Retrieve Rooms from Database
const retrieveRooms = async () => {
  try {
    // Assuming you've already fetched buildings at this point
    const roomsResponse = await RoomServices.getAll();
    const enrichedRooms = roomsResponse.data.map((room) => {
      // Find the category for each type
      const building = buildings.value.find((c) => c.key === room.buildingId);
      return {
        ...room,
        buildingName: building ? building.title : 'Unknown Building', // Enriching room with building name
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
    } else {
      await RoomServices.create(roomData);
      console.log(roomData)
    }
    message.value = "Room saved successfully.";
    await retrieveRooms();
  } catch (error) {
    console.error("Error saving room:", error);
    message.value = `Error saving room: ${error.message || "Unknown error"}`;
  } finally {
    resetForm(); // Ensure form is reset here
    showAddRoomDialog.value = false; // Close dialog in finally to ensure it closes
  }
  console.log(roomData)
};

const deleteRoom = async (roomId) => {
  try {
    await RoomServices.delete(roomId);
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

const roomHeaders = ref([
  { title: "Room No.", key: "title" },
  { title: "Building", key: "buildingName" },
  { title: "Actions", key: "actions", sortable: false },
]);

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

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Buildings") {
    retrieveBuildings();
  } else if (newValue === "Rooms") {
    retrieveBuildings();
    retrieveRooms();
  } 
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === "Buildings") {
    retrieveBuildings();
  } else if (selectedTab.value === "Rooms") {
    retrieveBuildings();
    retrieveRooms();
  }
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Building Management</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="Buildings">Buildings</v-tab>
            <v-tab value="Rooms">Rooms</v-tab>
           
            
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">

            <!-- Buildings Section -->
            <div v-if="selectedTab === 'Buildings'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Buildings</span>
                  <v-btn color="secondary" @click="showAddBuildingDialog = true;">
                    Add New Building
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="buildingHeaders"
                    :items="buildings"
                    item-key="key"
                    class="elevation-1"
                      > 
                        <template v-slot:item.actions="{ item }">
                         <v-btn icon @click="editBuilding(item)">
                           <v-icon>mdi-pencil</v-icon>
                         </v-btn>
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

            <!-- Rooms Section -->
            <div v-if="selectedTab === 'Rooms'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Rooms</span>
                  <v-btn color="secondary" @click="openAddRoomDialog">
                    Add New Room
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="roomHeaders"
                    :items="rooms"
                    item-key="key"
                    class="elevation-1"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editRoom(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.roomId,
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
          <span class="headline">{{ editingBuilding ? "Edit" : "Add" }} Building</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Building Name"
                  v-model="newBuilding.title"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Building abbreviation"
                  v-model="newBuilding.abbreviation"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="No. of Rooms"
                  v-model="newBuilding.noOfRooms"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" @click="saveBuilding">Save</v-btn>
          <v-btn color="primary" text @click="closeBuildingDialog"
            >Cancel</v-btn
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
                    :rules="[rules.required]"
                    required
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
                    required
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

    
  </div>
</template>