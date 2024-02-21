<script setup>
import AssetCategoryServices from "../services/assetCategoryServices";
import AssetTypeServices from "../services/assetTypeServices";
import AssetProfileServices from "../services/assetProfileServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Types");
const assetCategories = ref([]);
const assetTypes = ref([]);
const showAddCategoryDialog = ref(false);
const showAddTypeDialog = ref(false);
const selectedCategoryName = ref("");
const validCategory = ref(false);
const validType = ref(false);
const validProfile = ref(false);
const rules = {
  required: (value) => !!value || "Required.",
};
const newCategory = ref({
  categoryName: '',
  desc: '',
});
const newType = ref({
  typeName: '',
  desc: '',
  categoryId: '',
});
// const newProfile = ref({
//   title: "",
//   startDate: "",
//   endDate: "",
// });

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
  // Assuming retrieveAssetCategories() populates assetCategories correctly
  await retrieveAssetCategories();

  const category = assetCategories.value.find(c => c.categoryId === type.categoryId);
  if (category) {
    // Make sure this is a string that matches one of the category names in assetCategories
    selectedCategoryName.value = category.categoryName;
  } else {
    console.error("Category not found for this type:", type.categoryId);
    // Fallback or handle the error appropriately
    selectedCategoryName.value = '';
  }

  newType.value = { ...type };
  editingType.value = true;
  showAddTypeDialog.value = true;
};




const saveType = async () => {
  let categoryId = null;
  if (selectedCategoryName.value) {
    try {
      const categoryResponse = await AssetCategoryServices.getCategoryIdByName(selectedCategoryName.value);
      console.log(categoryResponse);
      // Directly access the categoryId from the response object
      categoryId = categoryResponse.data.categoryId;
    } catch (error) {
      console.error(error);
      message.value = "Error finding category ID.";
      return;
    }
  }

  if (!categoryId) {
    message.value = "Category not found or not selected.";
    return;
  }

  const typeData = {
    ...newType.value,
    categoryId: categoryId,
  };

  if (editingType.value) {
    try {
      const response = await AssetTypeServices.update(newType.value.id, typeData);
      const updatedData = response.data;
      const index = assetTypes.value.findIndex(a => a.id === newType.value.id);
      if (index !== -1) {
        assetTypes.value[index] = {
          ...updatedData,
          assetCategory: { 
            categoryId: categoryId, 
            categoryName: selectedCategoryName.value
          }
        };
        message.value = "Type updated successfully.";
      } else {
        message.value = "Error: Type not found in the list.";
      }
    } catch (error) {
      console.error(error);
      message.value = "Error updating type.";
    }
  } else {
    try {
      const response = await AssetTypeServices.create(typeData);
      assetTypes.value.push({
        ...response.data,
        assetCategory: { 
          categoryId: categoryId,
          categoryName: selectedCategoryName.value 
        }
      });
      message.value = "Type added successfully.";
    } catch (error) {
      console.error(error);
      message.value = "Error adding type.";
    }
  }

  editingType.value = false;
  showAddTypeDialog.value = false;
  newType.value = { title: '', categoryId: '' };
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

const closeTypeDialog = () => {
  showAddTypeDialog.value = false;
  editingType.value = false;
  newType.value = { typeName: "", categoryId: '', desc: "" };
};

// Categories Section

// Retrieve Categories from Database
const retrieveAssetCategories = async () => {
  try {
    const response = await AssetCategoryServices.getAll();
    assetCategories.value = response.data;
    console.log("Categories loaded:", assetCategories.value); // Log for debugging
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const retrieveCategoryNames = async () => {
  try {
    const response = await AssetCategoryServices.getAll();
    assetCategories.value = response.data.map(
      (category) => category.categoryName
    );
  } catch (error) {
    console.error(error);
    message.value = "Failed to load categories.";
  }
};

const getCategoryName = (categoryId) => {
  // Ensure categoryId is treated as a Number for strict equality comparison
  const numericCategoryId = Number(categoryId);
  const category = assetCategories.value.find(category => category.categoryId === numericCategoryId);
  return category ? category.categoryName : 'Unknown';
};



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
  newCategory.value = { ...category };
  editingCategory.value = true;
  showAddCategoryDialog.value = true;
};

const saveCategory = async () => {
  if (editingCategory.value) {
    try {
      const response = await AssetCategoryServices.update(
        newCategory.value.categoryId,
        newCategory.value
      );
      // Refresh the list of categories after successful update
      retrieveAssetCategories();
      // Find the index of the category in the array
      const index = assetCategories.value.findIndex(
        (c) => c.categoryId === newCategory.value.categoryId
      );

      if (index !== -1) {
        assetCategories.value[index] = {
          ...assetCategories.value[index],
          ...response.data,
        };
        message.value = "Category updated successfully.";
      } else {
        // Handle the case where the category wasn't found in the array
        console.error("Category not found in the local state.");
      }
    } catch (error) {
      console.error(error);
      message.value = "Error updating category.";
    }
  } else {
    // If we're adding a new category
    try {
      const response = await AssetCategoryServices.create(newCategory.value);
      assetCategories.value.push(response.data);
      message.value = "Category added successfully.";
      // Also refresh after adding a new category
      retrieveAssetCategories();
    } catch (error) {
      console.error(error);
      message.value = "Error adding category.";
    }
  }

  // Reset the form state
  editingCategory.value = false;
  showAddCategoryDialog.value = false;
  newCategory.value = { categoryName: "", desc: "" };
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

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "Categories") {
    retrieveAssetCategories();
  } else if (newValue === "Types") {
    retrieveAssetCategories();
    retrieveCategoryNames();
    retrieveAssetTypes();
  } else if (newValue === "Profiles") {
    // retrieveAssetProfiles();
    retrieveCategoryNames();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === "Categories") {
    retrieveAssetCategories();
  } else if (selectedTab.value === "Types") {
    retrieveAssetCategories();
    retrieveCategoryNames();
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
                  <v-table>
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="assetCategory in assetCategories"
                        :key="assetCategory.categoryId"
                      >
                        <td>{{ assetCategory.categoryName }}</td>
                        <td>{{ assetCategory.desc }}</td>
                        <td>
                          <v-btn icon @click="editCategory(assetCategory)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            @click="deleteCategory(assetCategory.categoryId)"
                          >
                            <v-icon color="primary">mdi-delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- Types Section -->
            <div v-if="selectedTab === 'Types'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Asset Types</span>
                  <v-btn color="secondary" @click="showAddTypeDialog = true; selectedCategoryName = '';">
                    Add New Type
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-table>
                    <thead>
                      <tr>
                        <th>Type Name</th>
                        <th>Type Category</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="assetType in assetTypes"
                        :key="assetType.typeId"
                      >
                        <td>{{ assetType.typeName }}</td>
                        <td>{{ assetType.assetCategory?.categoryName }}</td>
                        <td>{{ assetType.desc }}</td>
                        <td>
                          <v-btn icon @click="editType(assetType)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon @click="deleteType(assetType.typeId)">
                            <v-icon color="primary">mdi-delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
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
              v-model="newCategory.categoryName"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-text-field
              label="Description"
              v-model="newCategory.desc"
              :rules="[rules.required]"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            :disabled="!validCategory"
            @click="saveCategory(newCategory)"
            >Save</v-btn
          >
          <v-btn
            color="primary"
            text
            @click="showAddCategoryDialog = false"
            >Cancel</v-btn
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
                <v-select
                  label="Category"
                  :items="assetCategories"
                  v-model="selectedCategoryName"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" @click="saveType">Save</v-btn>
          <v-btn color="primary" text @click="closeTypeDialog"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
