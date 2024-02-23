<script setup>
import BuildingServices from "../services/buildingServices";
import RoomServices from "../services/roomServices";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Buildings");
const buildings = ref([]);
const showAddBuildingDialog = ref(false);
const editingBuilding = ref(false);
const validBuildings = ref(false);
const showDeleteConfirmDialog = ref(false);
const itemToDelete = ref(null);
const rules = {
  required: (value) => !!value || "Required.",
};

const newBuilding = ref({
  name: '',
  abbreviation: '',
  noOfRooms: '',
});

// Buildings Section

// Retrieve Buildings from Database
const retrieveBuildings = async () => {
  try {
    const response = await BuildingServices.getAll();
    buildings.value = response.data.map((building) => ({
      name: building.name,
      key: building.buildingId,
      abbreviation: building.abbreviation,
      noOfRooms: building.noOfRooms
    }));
  } catch (error) {
    console.error("Error loading buildings:", error);
  }
};


const editBuilding = async (building) => {
  newBuilding.value = {
    name: building.name,
    abbreviation: building.abbreviation,
    buildingId: building.key,
  };
  editingBuilding.value = true;
  showAddBuildingDialog.value = true;
};

const saveBuilding = async () => {
  const buildingData = {
    name: newBuilding.value.name,
    abbreviation: newBuilding.value.abbreviation,
    noOfRooms: newBuilding.value.noOfRooms,
  };

  try {
    let response;
    if (editingBuilding.value) {
      // Assuming your API expects an ID and the updated data for category updates
      response = await BuildingServices.update(
        newBuilding.value.buildingId,
        buildingData
      );
    } else {
      response = await BuildingServices.create(buildingData);
    }
    message.value = "Building saved successfully.";
    retrieveBuildings(); // Refresh categories list
  } catch (error) {
    console.error("Error saving building:", error);
    message.value = `Error saving building: ${
      error.message || "Unknown error"
    }`;
  } finally {
    editingBuilding.value = false;
    showAddBuildingDialog.value = false;
    newBuilding.value = { name: "", abbreviation: "", noOfRooms: "" }; // Reset the form
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
  { title: "Building Name", key: "name" },
  { title: "Abbreviation", key: "abbreviation", sortable: false },
  { title: "No. of Rooms", key: "noOfRooms", sortable: false },
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
  } 
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Buildings") {
    retrieveBuildings();
  } else if (newValue === "Rooms") {
    retrieveRooms();
  } 
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === "Buildings") {
    retrieveBuildings();
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
            <!-- Profiles Section -->
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
                  v-model="newBuilding.name"
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