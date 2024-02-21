<script setup>
import AssetCategoryServices from "../services/assetCategoryServices";
import BuildingServices from "../services/buildingServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("Buildings");
const assetCategories = ref([]);
const buildings = ref([]);
const showAddCategoryDialog = ref(false);
const showAddBuildingDialog = ref(false);
const selectedCategoryName = ref("");
const validCategory = ref(false);
const validBuildins = ref(false);
const rules = {
  required: (value) => !!value || "Required.",
};
const newCategory = ref({
  categoryName: '',
  desc: '',
});
const newBuilding = ref({
  name: '',
  abbreviation: '',
  noOfRooms: '',
});
// const newProfile = ref({
//   title: "",
//   startDate: "",
//   endDate: "",
// });

// Buildings Section

// Retrieve Buildings from Database
const retrieveBuildings = () => {
  BuildingServices.getAll()
    .then((response) => {
      buildings.value = response.data;
    })
    .catch((e) => {
      message.value = e.response.data.message;
    });
};

const editingBuilding = ref(false);

const editBuilding = async (building) => {

  newBuilding.value = { ...building };
  editingBuilding.value = true;
  showAddBuildingDialog.value = true;
};




const saveBuilding = async () => {
  
  const buildingData = {
    ...newBuilding.value,
  };

  if (editingBuilding.value) {
    try {
      const response = await BuildingServices.update(newBuilding.value.buildingId, buildingData);
      const updatedData = response.data;
      const index = buildings.value.findIndex(a => a.buildingId === newBuilding.value.buildingId);
      if (index !== -1) {
        buildings.value[index] = {
          ...updatedData,
        
        };
        message.value = "Building updated successfully.";
        retrieveBuildings();
      } else {
        message.value = "Error: Building not found in the list.";
      }
    } catch (error) {
      console.error(error);
      message.value = "Error updating building.";
    }
  } else {
    try {
      const response = await BuildingServices.create(buildingData);
      buildings.value.push({
        ...response.data,
       
      });
      message.value = "Building added successfully.";
    } catch (error) {
      console.error(error);
      message.value = "Error adding building.";
    }
  }

  editingBuilding.value = false;
  showAddBuildingDialog.value = false;
  newBuilding.value = { name: '', };
};

const deleteBuilding = async (buildingId) => {
  try {
    await BuildingServices.delete(buildingId);
    // Refresh the list of buildings after successful deletion
    retrieveBuildings();
    buildings.value = buildings.value.filter((t) => t.buildingId !== buildingId);
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
  } else if (newValue === "Buildings") {
    retrieveAssetCategories();
    retrieveCategoryNames();
    retrieveBuildings();
  } else if (newValue === "Profiles") {
    // retrieveAssetProfiles();
    retrieveCategoryNames();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === "Categories") {
    retrieveAssetCategories();
  } else if (selectedTab.value === "Buildings") {
    retrieveAssetCategories();
    retrieveCategoryNames();
    retrieveBuildings();
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
                  <v-table>
                    <thead>
                      <tr>
                        <th>Building Name</th>
                        <th>Abbreviation</th>
                        <th>No. of Rooms</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="building in buildings"
                        :key="building.buildingId"
                      >
                        <td>{{ building.name }}</td>
                        <td>{{ building.abbreviation }}</td>
                        <td>{{ building.noOfRooms}}</td>
                        <td>
                          <v-btn icon @click="editBuilding(building)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon @click="deleteBuilding(building.buildingId)">
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
  </div>
</template>
