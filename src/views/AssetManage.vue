<script setup>
import AssetCategoryServices from "../services/assetCategoryServices";
import AssetTypeServices from "../services/assetTypeServices";
import AssetProfileServices from "../services/assetProfileServices";
import SerializedAssetServices from "../services/serializedAssetServices";
import { ref, onMounted, watch, computed } from "vue";
import router from "../router";

const message = ref("");
const selectedTab = ref("SerializedAssets");
const selectedStatus = ref("Active");
const assetCategories = ref([]);
const assetTypes = ref([]);
const assetProfiles = ref([]);
const serializedAssets = ref([]);
const showAddCategoryDialog = ref(false);
const showAddTypeDialog = ref(false);
const showAddProfileDialog = ref(false);
const showAddSerializedAssetDialog = ref(false);
const editingCategory = ref(false);
const editingType = ref(false);
const editingProfile = ref(false);
const editingSerializedAsset = ref(false);
const selectedCategoryId = ref("");
const selectedTypeId = ref("");
const selectedProfileId = ref("");
const validCategory = ref(false);
const validType = ref(false);
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
const categoriesSortBy = ref([{ key: "title", order: "asc" }]);
const typesSortBy = ref([{ key: "title", order: "asc" }]);
const profilesSortBy = ref([{ key: "profileName", order: "asc" }]);
const assetsSortBy = ref([{ key: "profileName", order: "asc" }]);
const rules = {
  required: (value) => !!value || "Required.",
  maxDescLength: (value) => value.length <= 255,
  maxNameLength: (value) => value.length <= 50,
  serialNumberLength: (value) => value.length <= 20,
};

const newCategory = ref({
  title: "",
  description: "",
});
const newType = ref({
  title: "",
  description: "",
  categoryId: "",
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

// Categories Section

// Retrieve Categories from Database
const retrieveAssetCategories = async () => {
  try {
    const response = await AssetCategoryServices.getAll();
    assetCategories.value = response.data.map((category) => ({
      title: category.categoryName,
      key: category.categoryId,
      description: category.desc,
      activeStatus: category.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const editCategory = (category) => {
  newCategory.value = {
    title: category.title,
    description: category.description,
    activeStatus: category.activeStatus,
    categoryId: category.key,
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
      response = await AssetCategoryServices.update(
        newCategory.value.categoryId,
        categoryData
      );
      snackbarText.value = "Category updated successfully.";
    } else {
      response = await AssetCategoryServices.create(categoryData);
      snackbarText.value = "Category added successfully.";
    }
    snackbar.value = true; // Show the snackbar
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
    snackbarText.value = "Category deleted successfully.";
    snackbar.value = true; // Show the snackbar
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

const archiveCategory = async (categoryId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await AssetCategoryServices.update(categoryId, archiveData);
    snackbarText.value = "Category archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of categories after successful deletion
    retrieveAssetCategories();
    assetCategories.value = assetCategories.value.filter(
      (c) => c.id !== categoryId
    );
  } catch (error) {
    console.error(error);
    message.value = "Error archiving category.";
  }
};

const activateCategory = async (categoryId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await AssetCategoryServices.update(categoryId, activateData);
    snackbarText.value = "Category activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of categories after successful deletion
    retrieveAssetCategories();
    assetCategories.value = assetCategories.value.filter(
      (c) => c.id !== categoryId
    );
  } catch (error) {
    console.error(error);
    message.value = "Error archiving category.";
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
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);
const inactiveCategoryHeaders = ref([
  { title: "Category Name", key: "title" },
  { title: "Description", key: "description", sortable: false },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

const filteredAssetCategories = computed(() => {
  if (selectedStatus.value === "Active") {
    return assetCategories.value.filter(
      (category) => category.activeStatus === true
    );
  } else if (selectedStatus.value === "Inactive") {
    return assetCategories.value.filter(
      (category) => category.activeStatus === false
    );
  } else {
    return assetCategories.value;
  }
});

// Asset Types Section

// Retrieve Types from Database
const retrieveAssetTypes = async () => {
  try {
    // Assuming you've already fetched categories at this point
    const typesResponse = await AssetTypeServices.getAll();
    const enrichedTypes = typesResponse.data.map((type) => {
      // Find the category for each type
      const category = assetCategories.value.find(
        (c) => c.key === type.categoryId
      );
      return {
        ...type,
        categoryName: category ? category.title : "Unknown Category", // Enriching type with category name
        key: type.typeId, // Keeping your original key assignment
        title: type.typeName, // Assuming you're mapping typeName to title
        description: type.desc, // Direct mapping
        activeStatus: type.activeStatus,
        categoryId: type.categoryId,
      };
    });
    assetTypes.value = enrichedTypes;
  } catch (error) {
    console.error("Error loading types:", error);
    message.value = "Failed to load types.";
  }
};

const editType = (type) => {
  selectedCategoryId.value = type.categoryId; // Assuming you have this ID correctly set
  newType.value = {
    title: type.title,
    description: type.description,
    categoryId: type.categoryId,
    typeId: type.typeId,
  };
  editingType.value = true;
  showAddTypeDialog.value = true;
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
    typeName: newType.value.title,
    desc: newType.value.description,
    categoryId: selectedCategoryId.value, // Make sure this is getting set correctly
  };

  try {
    if (editingType.value) {
      console.log(newType.value.typeId);
      await AssetTypeServices.update(newType.value.typeId, typeData);
      snackbarText.value = "Type updated successfully.";
    } else {
      await AssetTypeServices.create(typeData);
      snackbarText.value = "Type added successfully.";
    }
    snackbar.value = true; // Show the snackbar
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
    snackbarText.value = "Type deleted successfully.";
    snackbar.value = true; // Show the snackbar
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

const filteredAssetTypes = computed(() => {
  return assetTypes.value.filter((type) => {
    // Filter by active status
    let statusMatch = true;
    if (selectedStatus.value === "Active") {
      statusMatch = type.activeStatus === true;
    } else if (selectedStatus.value === "Inactive") {
      statusMatch = type.activeStatus === false;
    }

    // Filter by selected category (from v-autocomplete)
    let categoryMatch = true;
    if (selectedCategoryId.value) {
      // Check if selectedCategoryId is not null before accessing its key
      categoryMatch =
        type.categoryId ===
        (selectedCategoryId.value ? selectedCategoryId.value.key : null);
    }

    // Filter by selected type (from v-autocomplete)
    let typeMatch = true;
    if (selectedTypeId.value) {
      // Check if selectedTypeId is not null before accessing its key
      typeMatch =
        type.key === (selectedTypeId.value ? selectedTypeId.value.key : null);
    }

    // Return types that match all the above criteria
    return statusMatch && categoryMatch && typeMatch;
  });
});

const filteredTypesForAutocomplete = computed(() => {
  // Check if a category is selected
  if (selectedCategoryId.value) {
    // Return types that belong to the selected category
    return assetTypes.value.filter(
      (type) => type.categoryId === selectedCategoryId.value.key
    );
  } else {
    // If no category is selected, return all types
    return assetTypes.value;
  }
});

const onCategoryClear = () => {
  selectedCategoryId.value = null;
  // Call the method to clear the category filter or reset the data view
};

const archiveType = async (typeId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await AssetTypeServices.update(typeId, archiveData);
    snackbarText.value = "Type archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of types after successful deletion
    retrieveAssetTypes();
    assetTypes.value = assetTypes.value.filter((c) => c.id !== typeId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving type.";
  }
};

const activateType = async (typeId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await AssetTypeServices.update(typeId, activateData);
    snackbarText.value = "Type activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of categories after successful deletion
    retrieveAssetTypes();
    assetTypes.value = assetTypes.value.filter((c) => c.id !== typeId);
  } catch (error) {
    console.error(error);
    message.value = "Error activating type.";
  }
};

const typeHeaders = ref([
  { title: "Type Name", key: "title" },
  { title: "Description", key: "description", sortable: false },
  { title: "Category", key: "categoryName" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const inactiveTypeHeaders = ref([
  { title: "Type Name", key: "title" },
  { title: "Description", key: "description", sortable: false },
  { title: "Category", key: "categoryName" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

// Profiles Section

// Retrieve Profiles from Database
const retrieveAssetProfiles = async () => {
  try {
    const response = await AssetProfileServices.getAll();
    const serializedAssetsResponse = await SerializedAssetServices.getAll();
    const serializedAssetsData = serializedAssetsResponse.data;

    assetProfiles.value = response.data.map((profile) => {
      const type = assetTypes.value.find((t) => t.key === profile.typeId);
      const assetsCount = serializedAssetsData.filter(
        (asset) => asset.profileId === profile.profileId
      ).length;
      return {
        ...profile,
        typeName: type ? type.title : "Unknown Type",
        key: profile.profileId,
        title: profile.profileName,
        assetsCount: assetsCount, // Add the count of serialized assets
      };
    });
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
    profileName: newProfile.value.profileName,
    desc: newProfile.value.desc,
    typeId: selectedTypeId.value,
  };

  try {
    // Check if editing an existing profile (i.e., `id` is present)
    if (editingProfile.value && newProfile.value.id) {
      // Call update service if editing
      await AssetProfileServices.update(newProfile.value.id, profileData);
      snackbarText.value = "Profile updated successfully.";
    } else {
      // Call create service if adding a new profile
      await AssetProfileServices.create(profileData);
      snackbarText.value = "Profile added successfully.";
    }
    snackbar.value = true; // Show the snackbar
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
  // Assign existing profile's properties, including its unique identifier
  newProfile.value = {
    ...profile,
    id: profile.profileId, // Adjust according to how profile IDs are named in your data
  };
  selectedTypeId.value = profile.typeId;
  editingProfile.value = true;
  showAddProfileDialog.value = true;
};

// Delete profile
const deleteProfile = async (profileId) => {
  try {
    await AssetProfileServices.delete(profileId);
    snackbarText.value = "Profile deleted successfully.";
    snackbar.value = true; // Show the snackbar
    retrieveAssetProfiles();
    message.value = "Profile deleted successfully.";
  } catch (error) {
    console.error("Error deleting profile:", error);
    message.value = "Error deleting profile.";
  }
};

function viewProfile(profileId) {
  console.log("Pushing to asset view with profileId: " + profileId);
  router.push({ name: "profileView", params: { profileId: profileId } });
}

const filteredAssetProfiles = computed(() => {
  if (selectedStatus.value === "Active") {
    return assetProfiles.value.filter(
      (profiles) => profiles.activeStatus === true
    );
  } else if (selectedStatus.value === "Inactive") {
    return assetProfiles.value.filter(
      (profiles) => profiles.activeStatus === false
    );
  } else {
    return assetProfiles.value;
  }
});

const archiveProfile = async (profileId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await AssetProfileServices.update(profileId, archiveData);
    snackbarText.value = "Profile archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of profiles after successful deletion
    retrieveAssetProfiles();
    assetProfiles.value = assetProfiles.value.filter((c) => c.id !== profileId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving profile.";
  }
};

const activateProfile = async (profileId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await AssetProfileServices.update(profileId, activateData);
    snackbarText.value = "Profile activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of categories after successful deletion
    retrieveAssetProfiles();
    assetProfiles.value = assetProfiles.value.filter((c) => c.id !== profileId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving profile.";
  }
};

const profileHeaders = ref([
  { title: "Profile Name", key: "profileName" },
  { title: "Type", key: "typeName" },
  { title: "# of Assets", key: "assets" },
  { title: "View Assets", key: "view" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const inactiveProfileHeaders = ref([
  { title: "Profile Name", key: "profileName" },
  { title: "Type", key: "typeName" },
  { title: "# of Assets", key: "assets" },
  { title: "View Assets", key: "view" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

// Serialized Asset Section

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

// Save asset (add or edit)
const saveSerializedAsset = async () => {
  const serializedAssetData = {
    serializedNumber: newSerializedAsset.value.serializedNumber,
    notes: newSerializedAsset.value.notes,
    profileId: selectedProfileId.value,
  };

  try {
    // Check if editing an existing serializedAsset (i.e., `id` is present)
    if (editingSerializedAsset.value && newSerializedAsset.value.id) {
      // Call update service if editing
      await SerializedAssetServices.update(
        newSerializedAsset.value.id,
        serializedAssetData
      );
      snackbarText.value = "Asset updated successfully.";
    } else {
      // Call create service if adding a new profile
      await SerializedAssetServices.create(serializedAssetData);
      snackbarText.value = "Asset added successfully.";
    }
    snackbar.value = true; // Show the snackbar
    message.value = "Asset saved successfully.";
    await retrieveSerializedAssets();
  } catch (error) {
    console.error("Error saving asset:", error);
    message.value = `Error saving asset: ${error.message || "Unknown error"}`;
  } finally {
    resetSerializedAssetForm();
    showAddSerializedAssetDialog.value = false;
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

// Delete profile
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

const filteredSerializedAssets = computed(() => {
  if (selectedStatus.value === "Active") {
    return serializedAssets.value.filter(
      (serializedAssets) => serializedAssets.activeStatus === true
    );
  } else if (selectedStatus.value === "Inactive") {
    return serializedAssets.value.filter(
      (serializedAssets) => serializedAssets.activeStatus === false
    );
  } else {
    return serializedAssets.value;
  }
});

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
    serializedAssets.value = serializedAssets.value.filter(
      (c) => c.id !== serializedAssetId
    );
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
    serializedAssets.value = serializedAssets.value.filter(
      (c) => c.id !== serializedAssetsId
    );
  } catch (error) {
    console.error(error);
    message.value = "Error archiving asset.";
  }
};

const serializedAssetHeaders = ref([
  // { title: "Asset Name", key: "assetName" },
  { title: "Name", key: "profileName" },
  { title: "Serial Number", key: "serializedNumber" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const inactiveSerializedAssetHeaders = ref([
  { title: "Name", key: "profileName" },
  { title: "Serial Number", key: "serializedNumber" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
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
  } else if (itemToDelete.value.type === "serializedAsset") {
    await deleteSerializedAsset(itemToDelete.value.id);
  }
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

const openArchiveDialog = (item) => {
  itemToArchive.value = item;
  showArchiveDialog.value = true;
};

const confirmArchive = async () => {
  if (itemToArchive.value.type === "category") {
    await archiveCategory(itemToArchive.value.id);
  } else if (itemToArchive.value.type === "type") {
    await archiveType(itemToArchive.value.id);
  } else if (itemToArchive.value.type === "profile") {
    await archiveProfile(itemToArchive.value.id);
  } else if (itemToArchive.value.type === "serializedAsset") {
    await archiveSerializedAsset(itemToArchive.value.id);
  }
  showArchiveDialog.value = false;
  itemToArchive.value = null; // Reset after deletion
};

const openActivateDialog = (item) => {
  itemToActivate.value = item;
  showActivateDialog.value = true;
};

const confirmActivate = async () => {
  if (itemToActivate.value.type === "category") {
    await activateCategory(itemToActivate.value.id);
  } else if (itemToActivate.value.type === "type") {
    await activateType(itemToActivate.value.id);
  } else if (itemToActivate.value.type === "profile") {
    await activateProfile(itemToActivate.value.id);
  } else if (itemToActivate.value.type === "serializedAsset") {
    await activateSerializedAsset(itemToActivate.value.id);
  }
  showActivateDialog.value = false;
  itemToActivate.value = null; // Reset after deletion
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Categories") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveAssetCategories();
      } else if (statusValue === "Inactive") {
      }
    });
  } else if (newValue === "Types") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveAssetCategories();
        retrieveAssetTypes();
      } else if (statusValue === "Inactive") {
      }
    });
  } else if (newValue === "Profiles") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveAssetCategories();
        retrieveAssetTypes();
        retrieveAssetProfiles();
      } else if (statusValue === "Inactive") {
      }
    });
  } else if (newValue === "SerializedAssets") {
    watch(selectedStatus, (statusValue) => {
      if (statusValue === "Active") {
        retrieveAssetCategories();
        retrieveAssetTypes();
        retrieveAssetProfiles();
        retrieveSerializedAssets();
      } else if (statusValue === "Inactive") {
      }
    });
  }
});

watch(selectedCategoryId, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    selectedTypeId.value = null; // Reset selected type when category changes
  }
});

watch(selectedTab, (newValue) => {
  localStorage.setItem("selectedTab", newValue);
});

watch(selectedStatus, (newValue) => {
  localStorage.setItem("selectedStatus", newValue);
});

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  const savedTab = localStorage.getItem("selectedTab");
  const savedStatus = localStorage.getItem("selectedStatus");
  if (savedTab) {
    selectedTab.value = savedTab;
    selectedStatus.value = savedStatus;
  }
  await retrieveAssetCategories();
  await retrieveAssetTypes(); // Ensure types are loaded before profiles
  await retrieveAssetProfiles(); // Now safe to load profiles
  await retrieveSerializedAssets(); // Now safe to load profiles
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
            <v-tab color="primary" value="SerializedAssets">Assets</v-tab>
            <v-tab color="primary" value="Profiles">Profiles</v-tab>
            <v-tab color="primary" value="Types">Types</v-tab>
            <v-tab color="primary" value="Categories">Categories</v-tab>
          </v-tabs>
        </v-col>
      </v-row>
      <v-tabs v-model="selectedStatus" background-color="primary" dark>
        <v-tab color="primary" value="Active">Active</v-tab>
        <v-tab color="primary" value="Inactive">Archived</v-tab>
      </v-tabs>

      <!-- Place the filters outside the conditional blocks -->
      <div v-if="selectedTab === 'Types'">
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="selectedCategoryId"
              :items="assetCategories"
              item-text="title"
              item-value="key"
              label="Filter by Category"
              return-object
              clearable
              small-chips
              @clear="onCategoryClear"
            ></v-autocomplete>

            <v-autocomplete
              v-model="selectedTypeId"
              :items="filteredTypesForAutocomplete"
              item-text="title"
              item-value="key"
              label="Filter by Type"
              return-object
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
      </div>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Active Categories Section -->
            <div
              v-if="selectedTab === 'Categories' && selectedStatus === 'Active'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Categories</span>
                  <v-btn color="primary" @click="showAddCategoryDialog = true">
                    Add New Category
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="categoryHeaders"
                    :items="filteredAssetCategories"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="categoriesSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editCategory(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'category',
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
            <!-- Inactive Categories Section -->
            <div
              v-if="
                selectedTab === 'Categories' && selectedStatus === 'Inactive'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Archived Categories</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="inactiveCategoryHeaders"
                    :items="filteredAssetCategories"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="categoriesSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editCategory(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'category',
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

            <!-- Active Types Section -->
            <div v-if="selectedTab === 'Types' && selectedStatus === 'Active'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Types</span>
                  <v-btn color="primary" @click="openAddTypeDialog">
                    Add New Type
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="typeHeaders"
                    :items="filteredAssetTypes"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="typesSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editType(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'type',
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

            <!-- Inactive Types Section -->
            <div
              v-if="selectedTab === 'Types' && selectedStatus === 'Inactive'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Inactive Types</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="inactiveTypeHeaders"
                    :items="filteredAssetTypes"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="typesSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editType(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'type',
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

            <!-- Active profiles Section -->
            <div
              v-if="selectedTab === 'Profiles' && selectedStatus === 'Active'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Profiles</span>
                  <v-btn color="primary" @click="openAddProfileDialog"
                    >Add New Profile</v-btn
                  >
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="profileHeaders"
                    :items="filteredAssetProfiles"
                    item-key="profileId"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="profilesSortBy"
                  >
                    <template v-slot:item.assets="{ item }">
                      {{ item.assetsCount }}
                    </template>
                    <template v-slot:item.view="{ item }">
                      <div
                        class="d-flex align-center justify-start"
                        style="padding-left: 10%"
                      >
                        <v-btn icon @click="viewProfile(item.profileId)">
                          <v-icon>mdi-eye</v-icon>
                        </v-btn>
                      </div>
                    </template>
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editProfile(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'profile',
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

            <!-- Inactive profiles Section -->
            <div
              v-if="selectedTab === 'Profiles' && selectedStatus === 'Inactive'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Archived Profiles</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="inactiveProfileHeaders"
                    :items="filteredAssetProfiles"
                    item-key="profileId"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="profilesSortBy"
                  >
                    <template v-slot:item.assets="{ item }">
                      {{ item.assetsCount }}
                    </template>
                    <template v-slot:item.view="{ item }">
                      <div
                        class="d-flex align-center justify-start"
                        style="padding-left: 15%"
                      >
                        <v-btn icon @click="viewProfile(item.profileId)">
                          <v-icon>mdi-eye</v-icon>
                        </v-btn>
                      </div>
                    </template>
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editProfile(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'profile',
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
            <!-- Active serialized assets Section -->
            <div
              v-if="
                selectedTab === 'SerializedAssets' &&
                selectedStatus === 'Active'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Assets</span>
                  <v-btn color="primary" @click="openAddSerializedAssetDialog">
                    Add New Asset
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="serializedAssetHeaders"
                    :items="filteredSerializedAssets"
                    item-key="serializedAssetId"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="assetsSortBy"
                  >
                    <template v-slot:item.assetName="{ item }">
                      {{ item.profileName }} {{ item.serializedNumber }}
                    </template>
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editSerializedAsset(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'serializedAsset',
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

            <!-- Inactive serialized assets Section -->
            <div
              v-if="
                selectedTab === 'SerializedAssets' &&
                selectedStatus === 'Inactive'
              "
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active Serial Assets</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="inactiveSerializedAssetHeaders"
                    :items="filteredSerializedAssets"
                    item-key="serializedAssetId"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="assetsSortBy"
                  >
                    <template v-slot:item.assetName="{ item }">
                      {{ item.profileName }} {{ item.serializedNumber }}
                    </template>
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
                        "
                      >
                        <v-icon>mdi-arrow-down-box</v-icon>
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
              :rules="[rules.required, rules.maxNameLength]"
              maxLength="50"
              counter
            ></v-text-field>
            <v-text-field
              label="Description"
              v-model="newCategory.description"
              :rules="[rules.required, rules.maxDescLength]"
              maxlength="255"
              counter
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
                    v-model="newType.title"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="50"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Type Description"
                    v-model="newType.description"
                    :rules="[rules.required, rules.maxDescLength]"
                    maxlength="255"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Category Selection -->
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
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="50"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Asset Type Selection -->
                  <v-select
                    label="Type"
                    :items="assetTypes"
                    item-text="title"
                    item-value="key"
                    v-model="selectedTypeId"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Description"
                    v-model="newProfile.desc"
                    :rules="[rules.required, rules.maxDescLength]"
                    maxlength="255"
                    counter
                  ></v-text-field>
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
          <v-btn color="saveblue" @click="saveProfile" :disabled="!validProfile"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

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
                    :rules="[rules.required, rules.serialNumberLength]"
                    maxlength="20"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <!-- Asset Profile Selection -->
                  <v-select
                    label="Profile"
                    :items="assetProfiles"
                    item-text="title"
                    item-value="key"
                    v-model="selectedProfileId"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Notes"
                    v-model="newSerializedAsset.notes"
                    :rules="[rules.required, rules.maxDescLength]"
                    maxlength="255"
                    counter
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeSerializedAssetDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="saveblue"
            @click="saveSerializedAsset"
            :disabled="!validSerializedAsset"
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
    </v-snackbar>
  </div>
</template>
