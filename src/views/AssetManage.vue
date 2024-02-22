<script setup>
import AssetCategoryServices from "../services/assetCategoryServices";
import AssetTypeServices from "../services/assetTypeServices";
import AssetProfileServices from "../services/assetProfileServices";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Categories");
const assetCategories = ref([]);
const assetTypes = ref([]);
const showAddCategoryDialog = ref(false);
const showAddTypeDialog = ref(false);
const selectedCategoryId = ref("");
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
// const newProfile = ref({
//   title: "",
//   startDate: "",
//   endDate: "",
// });

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

// const retrieveCategoryNames = async () => {
//   try {
//     const response = await AssetCategoryServices.getAll();
//     assetCategories.value = response.data.map(
//       (category) => category.categoryName
//     );
//   } catch (error) {
//     console.error(error);
//     message.value = "Failed to load categories.";
//   }
// };

// const getCategoryName = (categoryId) => {
//   // Ensure categoryId is treated as a Number for strict equality comparison
//   const numericCategoryId = Number(categoryId);
//   const category = assetCategories.value.find(
//     (category) => category.categoryId === numericCategoryId
//   );
//   return category ? category.categoryName : "Unknown";
// };

const getCategoryIdByName = async (categoryName) => {
  try {
    const response = await AssetCategoryServices.getCategoryIdByName(
      categoryName
    );
    return response.data[0]; // Assuming the service returns an array and you need the first item
  } catch (error) {
    console.error(error);
    message.value = `Error fetching category by name: ${categoryName}.`;
    return null;
  }
};

const editingCategory = ref(false);

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
      response = await AssetCategoryServices.update(newCategory.value.categoryId, categoryData);
    } else {
      response = await AssetCategoryServices.create(categoryData);
    }
    message.value = "Category saved successfully.";
    retrieveAssetCategories(); // Refresh categories list
  } catch (error) {
    console.error("Error saving category:", error);
    message.value = `Error saving category: ${error.message || "Unknown error"}`;
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
  { title: "Description", key: "description" },
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

const editingType = ref(false);

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
    // Distinguish between creating a new type and updating an existing one
    if (editingType.value) {
      // Update existing type
      await AssetTypeServices.update(newType.value.id, typeData);
    } else {
      // Create new type
      await AssetTypeServices.create(typeData);
    }

    // Display a success message
    message.value = "Type saved successfully.";

    // Refresh the list of types to reflect the change
    await retrieveAssetTypes();
  } catch (error) {
    // Log and display any errors encountered during the save operation
    console.error("Error saving type:", error);
    message.value = `Error saving type: ${error.message || "Unknown error"}`;
  } finally {
    closeTypeDialog(); // Resets the form after saving or if an error occurs
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
  newType.value = { typeName: "", desc: "", categoryId: "" };
  selectedCategoryId.value = ""; // Reset to a default or initial value if necessary
  validType.value = false; // Assuming you're using this to control the 'Save' button's disabled state
  // Reset any additional state here
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
  { title: "Description", key: "desc" },
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
    // retrieveAssetProfiles();
    // retrieveCategoryNames();
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
    // retrieveAssetProfiles();
    retrieveAssetCategories();
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
          <v-btn color="primary" text @click="closeCategoryDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="green darken-1"
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
          <v-btn color="primary" text @click="closeTypeDialog">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveType" :disabled="!validType"
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
            color="green darken-1"
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
