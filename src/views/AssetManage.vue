<script setup>
import AssetCategoryServices from "../services/assetCategoryServices";
import AssetTypeServices from "../services/assetTypeServices";
import AssetProfileServices from "../services/assetProfileServices";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Profiles");
const assetCategories = ref([]);
const assetTypes = ref([]);
const assetProfiles = ref([]);
const showAddCategoryDialog = ref(false);
const showAddTypeDialog = ref(false);
const showAddProfileDialog = ref(false);
const editingCategory = ref(false);
const editingType = ref(false);
const editingProfile = ref(false);
const selectedCategoryId = ref("");
const selectedTypeId = ref("");
const validCategory = ref(false);
const validType = ref(false);
const validProfile = ref(false);
const showDeleteConfirmDialog = ref(false);
const itemToDelete = ref(null);
const rules = {
  required: (value) => !!value || "Required.",
};

const newCategory = ref({
  title: "",
  description: "",
});
const newType = ref({
  typeName: "",
  desc: "",
  categoryId: "",
});
const newProfile = ref({
  profileName: "",
  desc: "",
  typeId: "",
});

// Categories Section

// Retrieve Categories from Database
const retrieveAssetCategories = async () => {
  try {
    const response = await AssetCategoryServices.getAll();
    assetCategories.value = response.data.map((category) => ({
      title: category.categoryName,
      key: category.categoryId,
      description: category.desc,
    }));
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const editCategory = (category) => {
  newCategory.value = {
    title: category.title,
    description: category.description,
    categoryId: category.key, // Ensure you have categoryId or equivalent to identify the category
  };
  editingCategory.value = true;
  showAddCategoryDialog.value = true;
};

const saveCategory = async () => {
  const categoryData = {
    categoryName: newCategory.value.title,
    desc: newCategory.value.description,
  };

  try {
    let response;
    if (editingCategory.value) {
      // Assuming your API expects an ID and the updated data for category updates
      response = await AssetCategoryServices.update(
        newCategory.value.categoryId,
        categoryData
      );
    } else {
      response = await AssetCategoryServices.create(categoryData);
    }
    message.value = "Category saved successfully.";
    retrieveAssetCategories(); // Refresh categories list
  } catch (error) {
    console.error("Error saving category:", error);
    message.value = `Error saving category: ${
      error.message || "Unknown error"
    }`;
  } finally {
    editingCategory.value = false;
    showAddCategoryDialog.value = false;
    newCategory.value = { title: "", description: "" }; // Reset the form
  }
};

const deleteCategory = async (categoryId) => {
  try {
    await AssetCategoryServices.delete(categoryId);
    // Refresh the list of categories after successful deletion
    retrieveAssetCategories();
    assetCategories.value = assetCategories.value.filter(
      (c) => c.id !== categoryId
    );
  } catch (error) {
    console.error(error);
    message.value = "Error deleting category.";
  }
};

const closeCategoryDialog = () => {
  showAddCategoryDialog.value = false;
  editingCategory.value = false;
  newCategory.value = { categoryName: "", desc: "" };
};

const categoryHeaders = ref([
  { title: "Category Name", key: "title" },
  { title: "Description", key: "description", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
]);

// Asset Types Section

// Retrieve Types from Database
const retrieveAssetTypes = () => {
  AssetTypeServices.getAll()
    .then((response) => {
      assetTypes.value = response.data;
    })
    .catch((e) => {
      message.value = e.response.data.message;
    });
};

const editType = async (type) => {
  console.log("Editing type:", type);
  if (type.typeId) {
    await retrieveAssetCategories();
    // Find the category using `c.key` to match `type.categoryId`
    const category = assetCategories.value.find(
      (c) => c.key === type.categoryId
    );
    if (category) {
      // Since v-select is bound to selectedCategoryId, ensure it's set to the expected value format
      selectedCategoryId.value = category.key; // Assuming v-select is configured to work with category IDs
    } else {
      console.error("Category not found for this type:", type.categoryId);
      selectedCategoryId.value = "";
    }
    newType.value = { ...type, id: type.typeId };
    editingType.value = true;
    showAddTypeDialog.value = true;
  } else {
    console.error("Type ID is undefined in editType function");
  }
};

const saveType = async () => {
  let categoryId = selectedCategoryId.value; // Directly use the selected category ID
  console.log(categoryId);
  if (!categoryId) {
    console.error("Category not selected.");
    message.value = "Category not found or not selected.";
    return;
  }

  // Prepare the type data for saving
  const typeData = {
    ...newType.value,
    categoryId: categoryId,
  };

  try {
    if (editingType.value) {
      await AssetTypeServices.update(newType.value.id, typeData);
    } else {
      await AssetTypeServices.create(typeData);
    }
    message.value = "Type saved successfully.";
    await retrieveAssetTypes();
  } catch (error) {
    console.error("Error saving type:", error);
    message.value = `Error saving type: ${error.message || "Unknown error"}`;
  } finally {
    resetForm(); // Ensure form is reset here
    showAddTypeDialog.value = false; // Close dialog in finally to ensure it closes
  }
};

const deleteType = async (typeId) => {
  try {
    await AssetTypeServices.delete(typeId);
    // Refresh the list of types after successful deletion
    retrieveAssetTypes();
    assetTypes.value = assetTypes.value.filter((t) => t.id !== typeId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting type.";
  }
};

const resetForm = () => {
  newType.value = { typeName: "", desc: "", categoryId: "", id: null }; // Explicitly set `id` to `null`
  selectedCategoryId.value = "";
  validType.value = false;
  editingType.value = false; // Explicitly reset editing flag
};

const closeTypeDialog = () => {
  resetForm(); // Resets form when closing or canceling the dialog
  showAddTypeDialog.value = false;
};

const openAddTypeDialog = () => {
  resetForm(); // Ensure form is reset when dialog is opened
  showAddTypeDialog.value = true;
};

const typeHeaders = ref([
  { title: "Type Name", key: "typeName" },
  { title: "Type Category", key: "assetCategory.categoryName" },
  { title: "Description", key: "desc", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
]);

// Profiles Section

// Retrieve Profiles from Database
const retrieveAssetProfiles = async () => {
  try {
    const response = await AssetProfileServices.getAll();
    assetProfiles.value = response.data;
  } catch (error) {
    console.error("Error loading profiles:", error);
    message.value = "Failed to load profiles.";
  }
};

// Open dialog to add a new profile
const openAddProfileDialog = () => {
  resetProfileForm();
  showAddProfileDialog.value = true;
};

// Reset the profile form to its default state
const resetProfileForm = () => {
  newProfile.value = { profileName: "", desc: "", typeId: "" };
  selectedTypeId.value = "";
  validProfile.value = false;
  editingProfile.value = false;
};

// Save profile (add or edit)
const saveProfile = async () => {
  const profileData = {
    ...newProfile.value,
    typeId: selectedTypeId.value,
  };

  try {
    if (editingProfile.value && newProfile.value.id) {
      await AssetProfileServices.update(newProfile.value.id, profileData);
    } else {
      await AssetProfileServices.create(profileData);
    }
    message.value = "Profile saved successfully.";
    await retrieveAssetProfiles();
  } catch (error) {
    console.error("Error saving profile:", error);
    message.value = `Error saving profile: ${error.message || "Unknown error"}`;
  } finally {
    resetProfileForm();
    showAddProfileDialog.value = false;
  }
};

// Edit profile
const editProfile = (profile) => {
  newProfile.value = { ...profile, id: profile.profileId };
  selectedTypeId.value = profile.typeId;
  editingProfile.value = true;
  showAddProfileDialog.value = true;
};

// Delete profile
const deleteProfile = async (profileId) => {
  try {
    await AssetProfileServices.delete(profileId);
    retrieveAssetProfiles();
    message.value = "Profile deleted successfully.";
  } catch (error) {
    console.error("Error deleting profile:", error);
    message.value = "Error deleting profile.";
  }
};

const profileHeaders = ref([
  { title: "Profile Name", key: "profileName" },
  { title: "Description", key: "desc", sortable: false },
  { title: "Type ID", key: "typeId" },
  { title: "Actions", key: "actions", sortable: false },
]);

// Misc Section

const openDeleteConfirmDialog = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value.type === "category") {
    await deleteCategory(itemToDelete.value.id);
  } else if (itemToDelete.value.type === "type") {
    await deleteType(itemToDelete.value.id);
  } else if (itemToDelete.value.type === "profile") {
    await deleteProfile(itemToDelete.value.id);
  }
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Categories") {
    retrieveAssetCategories();
  } else if (newValue === "Types") {
    retrieveAssetCategories();
    // retrieveCategoryNames();
    retrieveAssetTypes();
  } else if (newValue === "Profiles") {
    retrieveAssetCategories();
    retrieveAssetTypes();
    retrieveAssetProfiles();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === "Categories") {
    retrieveAssetCategories().then(() => {
      console.log(assetCategories.value); // Check the structure and data
    });
  } else if (selectedTab.value === "Types") {
    retrieveAssetCategories();
    // retrieveCategoryNames();
    retrieveAssetTypes();
  } else if (selectedTab.value === "Profiles") {
    retrieveAssetCategories();
    retrieveAssetTypes();
    retrieveAssetProfiles();
  }
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Asset Management</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="Profiles">Asset Profiles</v-tab>
            <v-tab value="Types">Asset Types</v-tab>
            <v-tab value="Categories">Asset Categories</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Categories Section -->
            <div v-if="selectedTab === 'Categories'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Asset Categories</span>
                  <v-btn
                    color="secondary"
                    @click="showAddCategoryDialog = true"
                  >
                    Add New Category
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="categoryHeaders"
                    :items="assetCategories"
                    item-key="key"
                    class="elevation-1"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editCategory(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.key,
                            type: 'category',
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

            <!-- Types Section -->
            <div v-if="selectedTab === 'Types'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Asset Types</span>
                  <v-btn color="secondary" @click="openAddTypeDialog">
                    Add New Type
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="typeHeaders"
                    :items="assetTypes"
                    item-key="typeId"
                    class="elevation-1"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editType(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.typeId,
                            type: 'type',
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
            <div v-if="selectedTab === 'Profiles'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Asset Profiles</span>
                  <v-btn color="secondary" @click="openAddProfileDialog"
                    >Add New Profile</v-btn
                  >
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="profileHeaders"
                    :items="assetProfiles"
                    item-key="profileId"
                    class="elevation-1"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editProfile(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        @click="
                          openDeleteConfirmDialog({
                            id: item.profileId,
                            type: 'profile',
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

    <!-- Add/Edit Category Dialog -->
    <v-dialog v-model="showAddCategoryDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingCategory ? "Edit" : "Add" }} Category
        </v-card-title>
        <v-card-text>
          <v-form ref="formCategory" v-model="validCategory">
            <v-text-field
              label="Category Name"
              v-model="newCategory.title"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-text-field
              label="Description"
              v-model="newCategory.description"
              :rules="[rules.required]"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeCategoryDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="saveblue"
            :disabled="!validCategory"
            @click="saveCategory(newCategory)"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Type Dialog -->
    <v-dialog v-model="showAddTypeDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingType ? "Edit" : "Add" }} Type</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formType" v-model="validType">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Type Name"
                    v-model="newType.typeName"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Type Description"
                    v-model="newType.desc"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Ensure selectedCategoryId is properly validated if necessary -->
                  <v-select
                    label="Category"
                    :items="assetCategories"
                    v-model="selectedCategoryId"
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
          <!-- Use the validType model to control the disabled state -->
          <v-btn color="cancelgrey" text @click="closeTypeDialog">Cancel</v-btn>
          <v-btn color="saveblue" @click="saveType" :disabled="!validType"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Add/Edit Profile Dialog -->
    <v-dialog v-model="showAddProfileDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ editingProfile ? "Edit" : "Add" }} Profile</span
          >
        </v-card-title>
        <v-card-text>
          <v-form ref="formProfile" v-model="validProfile">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Profile Name"
                    v-model="newProfile.profileName"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Description"
                    v-model="newProfile.desc"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Asset Type Selection -->
                  <v-select
                    label="Type"
                    :items="assetTypes"
                    item-text="typeName"
                    item-value="typeId"
                    v-model="selectedTypeId"
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
          <v-btn color="cancelgrey" text @click="showAddProfileDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="saveblue"
            @click="saveProfile"
            :disabled="!validProfile"
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
  </div>
</template>
