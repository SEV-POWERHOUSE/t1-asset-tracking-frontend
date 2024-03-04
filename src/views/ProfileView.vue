<script setup>
import AssetProfileServices from "../services/assetProfileServices";
import SerializedAssetServices from "../services/serializedAssetServices";
import { ref, onMounted, watch, defineProps } from "vue";
import router from '../router';

const message = ref("");
const people = ref([]);
const serializedAssets = ref([]);
const assetProfiles = ref([]);
const selectedTab = ref("");
const selectedStatus = ref("Active");
const selectedProfileId = ref("");
const showAddSerializedAssetDialog = ref(false);
const editingSerializedAsset = ref(false);
const validProfile = ref(false);
const validSerializedAsset = ref(false);
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
};

const props = defineProps({
        profileId: {
            required: true,
        },
        
    });

  const newProfile = ref({
  profileName: "",
  desc: "",
  typeId: "",
});

const newSerializedAsset = ref({
  serializedNumber: "",
  notes: "",
  profileId: "",
});

// Profile Section

// Retrieve Buildings from Database
const retrieveAssetsForProfile = async () => {
  try {
    const response = await SerializedAssetServices.getAll();
    serializedAssets.value = response.data.map((serializedAsset) => {
      const profile = assetProfiles.value.find((t) => t.key === serializedAsset.profileId);
      return {
        ...serializedAsset,
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

// Edit asset
const editSerializedAsset = (serializedAsset) => {
  // Assign existing assets properties, including its unique identifier
  newSerializedAsset.value = {
    ...serializedAsset,
    id: serializedAsset.serializedAssetId, // Adjust according to how profile IDs are named in your data
  };
  selectedProfileId.value = serializedAsset.profileId;
  editingSerializedAsset.value = true;
  showAddSerializedAssetDialog.value = true;
};

// Save asset (add or edit)
const saveSerializedAsset = async () => {
  const serializedAssetData = {
    serializedNumber: newSerializedAsset.value.serializedNumber,
    notes: newSerializedAsset.value.notes,
    profileId: selectedProfileId.value,
  };

  try {
  if (editingSerializedAsset.value && newSerializedAsset.value.id) {
    await SerializedAssetServices.update(newSerializedAsset.value.id, serializedAssetData);
    snackbarText.value = "Asset updated successfully.";
  } else {
    await SerializedAssetServices.create(serializedAssetData);
    snackbarText.value = "Asset added successfully.";
  }
  snackbar.value = true;
  message.value = "Asset saved successfully.";
  await retrieveAssetsForProfile(); // Refresh the list after saving
} catch (error) {
  console.error("Error saving asset:", error);
  message.value = `Error saving asset: ${error.message || "Unknown error"}`;
} finally {
  resetSerializedAssetForm();
  showAddSerializedAssetDialog.value = false;
}
};


// Delete asset
const deleteSerializedAsset = async (serializedAssetId) => {
  try {
    await SerializedAssetServices.delete(serializedAssetId);
    snackbarText.value = "Asset deleted successfully.";
    snackbar.value = true; // Show the snackbar
    retrieveSerializedAssets();
    message.value = "Asset deleted successfully.";
  } catch (error) {
    console.error("Error deleting asset:", error);
    message.value = "Error deleting asset.";
  }
};

// Open dialog to add a new profile
const openAddSerializedAssetDialog = () => {
  resetSerializedAssetForm();
  showAddSerializedAssetDialog.value = true;
};

const closeSerializedAssetDialog = () => {
  resetSerializedAssetForm(); // Resets form when closing or canceling the dialog
  showAddSerializedAssetDialog.value = false;
};

// Reset the profile form to its default state
const resetSerializedAssetForm = () => {
  newSerializedAsset.value = { serializedNumber: "", notes: "", profileId: "" };
  selectedProfileId.value = "";
  validSerializedAsset.value = false;
  editingSerializedAsset.value = false;
};

const filterAssetsByProfileId = () => {
  return serializedAssets.value.filter(
    (asset) => 
      String(asset.profileId) === String(props.profileId) &&
      asset.activeStatus === (selectedStatus.value === 'Active')
  );
};

const archiveSerializedAsset = async (serializedAssetId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await SerializedAssetServices.update(serializedAssetId, archiveData);
    snackbarText.value = "Asset archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of assets after successful deletion
    retrieveSerializedAssets();
    serializedAssets.value = serializedAssets.value.filter((c) => c.id !== serializedAssetId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving asset.";
  }
};

const activateSerializedAsset = async (serializedAssetId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await SerializedAssetServices.update(serializedAssetId, activateData);
    snackbarText.value = "Asset activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of categories after successful deletion
    retrieveSerializedAssets();
    serializedAssets.value = serializedAssets.value.filter((c) => c.id !== serializedAssetsId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving asset.";
  }
};

const serializedAssetHeaders = ref([
  { title: "Serial Number", key: "serializedNumber" },
  { title: "Notes", key: "notes"},
  
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
  
]);

const archivedSerializedAssetHeaders = ref([
  { title: "Serial Number", key: "serializedNumber" },
  { title: "Notes", key: "notes"},
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
  
]);

// Misc Section
const profileDetails = ref({ profileName: 'Loading...' });

const retrieveProfileDetails = async () => {
  try {
    const response = await AssetProfileServices.getById(props.profileId);
    profileDetails.value = response.data;
  } catch (error) {
    console.error("Error loading profile details:", error);
    message.value = "Failed to load profile details.";
  }
};

const openDeleteConfirmDialog = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value.type === "serializedAsset") {
    await deleteSerializedAsset(itemToDelete.value.id);
    await retrieveAssetsForProfile(); // Refresh the list after deletion
    snackbarText.value = "Asset deleted successfully.";
    snackbar.value = true;
  }
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

const openArchiveDialog = (item) => {
  itemToArchive.value = item;
  showArchiveDialog.value = true;
};

const confirmArchive = async () => {
  if (itemToArchive.value.type === "serializedAsset") {
    await archiveSerializedAsset(itemToArchive.value.id);
    await retrieveAssetsForProfile(); // Refresh the list after archiving
    snackbarText.value = "Asset archived successfully.";
    snackbar.value = true;
  }
  showArchiveDialog.value = false;
  itemToArchive.value = null; // Reset after archiving
};

const openActivateDialog = (item) => {
  itemToActivate.value = item;
  showActivateDialog.value = true;
};

const confirmActivate = async () => {
  if (itemToActivate.value.type === "serializedAsset") {
    await activateSerializedAsset(itemToActivate.value.id);
    await retrieveAssetsForProfile(); // Refresh the list after activation
    snackbarText.value = "Asset activated successfully.";
    snackbar.value = true;
  }
  showActivateDialog.value = false;
  itemToActivate.value = null; // Reset after activation
};

const goBack = () => {
  router.go(-1); // Go back one step in the history
};



// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
    console.log("Attempting to get assetProfile with profileId: " + props.profileId)
    const assetProfile = await AssetProfileServices.getById(props.profileId);
    await retrieveProfileDetails();
    await retrieveAssetsForProfile();

    
 
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
  <v-btn icon @click="goBack">
    <v-icon>mdi-arrow-left</v-icon>
  </v-btn>
  <v-toolbar-title>{{ profileDetails.profileName }}</v-toolbar-title>
 
</v-toolbar>

          <v-tabs v-model="selectedStatus" background-color="primary" dark>
        <v-tab color="primary" value="Active">Active</v-tab>
        <v-tab color="primary" value="Archived">Archived</v-tab>
      </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Active asset for profile Section -->
            <div v-if="selectedStatus === 'Active'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active {{profileDetails.profileName}}</span>
                  <v-btn color="primary" @click="showAddSerializedAssetDialog = true">
                    Add New {{profileDetails.profileName}}
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                  :headers="serializedAssetHeaders"
                    :items="filterAssetsByProfileId()"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editSerializedAsset(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                      <template v-slot:item.archive="{ item }">
                        <v-btn icon @click="openArchiveDialog({ id: item.key, type: 'serializedAsset' })">
  <v-icon>mdi-arrow-down-box</v-icon>
</v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

              <!-- Archived Asset for profile Section -->
              <div v-if="selectedStatus === 'Archived'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active {{profileDetails.profileName}}'s</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                  :headers="archivedSerializedAssetHeaders"
                    :items="filterAssetsByProfileId()"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                  <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editSerializedAsset(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'serializedAsset',
                          })
                        " >
                        <v-icon>mdi-arrow-up-box</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.delete="{ item }">
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.key,
                            type: 'serializedAsset',
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

     <!-- Add/Edit serializedAsset Dialog -->
     <v-dialog v-model="showAddSerializedAssetDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ editingSerializedAsset ? "Edit" : "Add" }} Asset</span
          >
        </v-card-title>
        <v-card-text>
          <v-form ref="formSerializedAsset" v-model="validSerializedAsset">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Serial Number"
                    v-model="newSerializedAsset.serializedNumber"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Notes"
                    v-model="newSerializedAsset.notes"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeSerializedAssetDialog">Cancel</v-btn
          >
          <v-btn color="saveblue" @click="saveSerializedAsset" :disabled="!validSerializedAsset"
            >Save</v-btn
          >
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
