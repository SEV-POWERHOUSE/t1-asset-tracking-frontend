<script setup>
import AccommodationCategoryServices from '../services/accommodationCategoryServices';
import SemesterServices from '../services/semesterServices';
import AccommodationServices from "../services/accommodationServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { ref, onMounted, watch } from 'vue';

// Function to format date to MM-DD-YYYY for display
function formatDateForDisplay(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${month}-${day}-${d.getFullYear()}`;
}

// Function to format date to YYYY-MM-DD for input fields
function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// Function to parse date from input fields to JavaScript Date object as UTC noon
function parseDateFromInput(inputValue) {
  if (!inputValue) return null;
  
  const dateParts = inputValue.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is zero-indexed
  const day = parseInt(dateParts[2], 10);

  // Create a date object at noon UTC to avoid timezone affecting the date
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));

  return date;
}

const router = useRouter();
const user = Utils.getStore("user");
const message = ref("");
const selectedTab = ref('Categories');
const semesters = ref([]);
const accommodationCategories = ref([]);
const accommodations = ref([]);
const showAddSemesterDialog = ref(false);
const showAddCategoryDialog = ref(false);
const showAddAccommodationDialog = ref(false);
const selectedCategoryName = ref('');

const newSemester = ref({
  title: '',
  startDate: '',
  endDate: ''
});
const newCategory = ref({
  categoryName: '',
  desc: ''
});
const newAccommodation = ref({
  title: '',
  accommodationCategoryId: ''
});
const validSemester = ref(true);
const validCategory = ref(false);
const validAccommodation = ref(false);
const rules = {
  required: value => !!value || 'Required.'
};

// Categories Section

// Retrieve Categories from Database
const retrieveAccommodationCategories = () => {
  AccommodationCategoryServices.getAll()
    .then((response) => {
      accommodationCategories.value = response.data;
    })
    .catch((e) => {
      message.value = e.response.data.message;
    });
};

// Add new category
const addCategory = async (categoryData) => {
  try {
    const response = await AccommodationCategoryServices.create(categoryData);
    accommodationCategories.value.push(response.data);
  } catch (error) {
    console.error(error);
    message.value = "Error adding category.";
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
      const response = await AccommodationCategoryServices.update(newCategory.value.id, newCategory.value);
      // Find the index of the category in the array
      const index = accommodationCategories.value.findIndex(c => c.id === newCategory.value.id);

      if (index !== -1) {
        accommodationCategories.value[index] = { ...accommodationCategories.value[index], ...response.data };
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
      const response = await AccommodationCategoryServices.create(newCategory.value);
      accommodationCategories.value.push(response.data);
      message.value = "Category added successfully.";
    } catch (error) {
      console.error(error);
      message.value = "Error adding category.";
    }
  }

  // Reset the form state
  editingCategory.value = false;
  showAddCategoryDialog.value = false;
  newCategory.value = { categoryName: '', desc: '' };
};

const deleteCategory = async (categoryId) => {
  try {
    await AccommodationCategoryServices.delete(categoryId);
    accommodationCategories.value = accommodationCategories.value.filter(c => c.id !== categoryId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting category.";
  }
};

const closeCategoryDialog = () => {
  showAddCategoryDialog.value = false;
  editingCategory.value = false;
  newCategory.value = { categoryName: '', desc: '' };
};


// Accommodations Section

// Retrieve Accommodations from Database
const retrieveAccommodations = () => {
  AccommodationServices.getAll()
    .then((response) => {
      accommodations.value = response.data;
    })
    .catch((e) => {
      message.value = e.response.data.message;
    });
};

const retrieveCategoryNames = async () => {
  try {
    const response = await AccommodationCategoryServices.getAll();
    accommodationCategories.value = response.data.map(category => category.categoryName);
  } catch (error) {
    console.error(error);
    message.value = "Failed to load categories.";
  }
};

const getCategoryByName = async (categoryName) => {
  try {
    const response = await AccommodationCategoryServices.getByCategoryName(categoryName);
    return response.data[0]; // Assuming the service returns an array and you need the first item
  } catch (error) {
    console.error(error);
    message.value = `Error fetching category by name: ${categoryName}.`;
    return null;
  }
};

const editingAccommodation = ref(false);

const editAccommodation = async (accommodation) => {
  // Fetch the category name for the accommodation being edited
  if (accommodation && accommodation.accommodationCategoryId) {
    try {
      const categoryResponse = await AccommodationCategoryServices.get(accommodation.accommodationCategoryId);
      selectedCategoryName.value = categoryResponse.data.categoryName;
    } catch (error) {
      console.error(error);
      message.value = "Error fetching category details.";
      // Reset the selected category name if there is an error fetching category details
      selectedCategoryName.value = '';
    }
  } else {
    // Reset the selected category name if the accommodation doesn't have a category ID
    selectedCategoryName.value = '';
  }

  // Set the form data to the accommodation data for editing
  newAccommodation.value = { ...accommodation };
  editingAccommodation.value = true;
  showAddAccommodationDialog.value = true;
};

const saveAccommodation = async () => {
  let categoryId = null;
  if (selectedCategoryName.value) {
    try {
      const categoryResponse = await AccommodationCategoryServices.getByCategoryName(selectedCategoryName.value);
      const category = categoryResponse.data.find(cat => cat.categoryName === selectedCategoryName.value);
      categoryId = category.id;
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

  const accommodationData = {
    ...newAccommodation.value,
    accommodationCategoryId: categoryId,
  };

  if (editingAccommodation.value) {
    try {
      const response = await AccommodationServices.update(newAccommodation.value.id, accommodationData);
      const updatedData = response.data;
      const index = accommodations.value.findIndex(a => a.id === newAccommodation.value.id);
      if (index !== -1) {
        accommodations.value[index] = {
          ...updatedData,
          accommodationCategory: { 
            id: categoryId, 
            categoryName: selectedCategoryName.value
          }
        };
        message.value = "Accommodation updated successfully.";
      } else {
        message.value = "Error: Accommodation not found in the list.";
      }
    } catch (error) {
      console.error(error);
      message.value = "Error updating accommodation.";
    }
  } else {
    try {
      const response = await AccommodationServices.create(accommodationData);
      accommodations.value.push({
        ...response.data,
        accommodationCategory: { 
          id: categoryId,
          categoryName: selectedCategoryName.value 
        }
      });
      message.value = "Accommodation added successfully.";
    } catch (error) {
      console.error(error);
      message.value = "Error adding accommodation.";
    }
  }

  editingAccommodation.value = false;
  showAddAccommodationDialog.value = false;
  newAccommodation.value = { title: '', accommodationCategoryId: '' };
};

const deleteAccommodation = async (accommodationId) => {
  try {
    await AccommodationServices.delete(accommodationId);
    accommodations.value = accommodations.value.filter(a => a.id !== accommodationId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting accommodation.";
  }
};

const closeAccommodationDialog = () => {
  showAddAccommodationDialog.value = false;
  editingAccommodation.value = false;
  newAccommodation.value = { title: '', accommodationCategoryId: '' };
};


// Semesters Section

// Retrieve Semesters from Database
const retrieveSemesters = async () => {
  try {
    const response = await SemesterServices.getAll();
    semesters.value = response.data.map(semester => ({
      ...semester,
      startDate: formatDateForDisplay(semester.startDate),
      endDate: formatDateForDisplay(semester.endDate),
    }));
  } catch (e) {
    message.value = e.response.data.message;
  }
};

const editingSemester = ref(false);

const saveSemester = async () => {
  // Check if we are editing an existing semester or adding a new one
  const isEditing = editingSemester.value;

  // Validate your semester data here...
  if (!validSemester.value) {
    console.error('The form is not valid.');
    message.value = "Please fill in all required fields.";
    return;
  }

  // Create a Date object using the input value, adjusting for timezone
  const offset = new Date().getTimezoneOffset() * 60000;
  const adjustedStartDate = new Date(new Date(newSemester.value.startDate).getTime() + offset);
  const adjustedEndDate = new Date(new Date(newSemester.value.endDate).getTime() + offset);

  const semesterData = {
  ...newSemester.value,
  startDate: parseDateFromInput(newSemester.value.startDate).toISOString(),
  endDate: parseDateFromInput(newSemester.value.endDate).toISOString(),
};

  try {
    let response;

    // Update existing semester
    if (isEditing) {
      response = await SemesterServices.update(newSemester.value.id, semesterData);
      // Update the semester in the semesters array
      const index = semesters.value.findIndex(s => s.id === newSemester.value.id);
      if (index !== -1) {
        semesters.value[index] = {
          ...semesters.value[index],
          ...semesterData,
          startDate: formatDateForDisplay(semesterData.startDate),
          endDate: formatDateForDisplay(semesterData.endDate),
        };
      }
      message.value = "Semester updated successfully.";
    } else {
      // Add new semester
      response = await SemesterServices.create(semesterData);
      semesters.value.push({
        ...response.data,
        startDate: formatDateForDisplay(response.data.startDate),
        endDate: formatDateForDisplay(response.data.endDate),
      });
      message.value = "Semester added successfully.";
    }
  } catch (error) {
    console.error(error);
    message.value = "Error saving semester.";
  }

  // Resetting states after successful save/update
  editingSemester.value = false;
  showAddSemesterDialog.value = false;
  newSemester.value = { title: '', startDate: '', endDate: '' };
};

// Use this function to set the date inputs when editing
const editSemester = (semester) => {
  newSemester.value = {
    ...semester,
    startDate: formatDateForInput(semester.startDate),
    endDate: formatDateForInput(semester.endDate),
  };
  editingSemester.value = true;
  showAddSemesterDialog.value = true;
};

const deleteSemester = async (semesterId) => {
  try {
    await SemesterServices.delete(semesterId);
    semesters.value = semesters.value.filter(s => s.id !== semesterId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting semester.";
  }
};

// Method to close the dialog and reset the semester form
const closeSemesterDialog = () => {
  showAddSemesterDialog.value = false;
  editingSemester.value = false; // Reset editing mode if you have one
  newSemester.value = { title: '', startDate: '', endDate: '' }; // Reset the form fields
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === 'Semesters') {
    retrieveSemesters();
  } else if (newValue === 'Categories') {
    retrieveAccommodationCategories();
  } else if (newValue === 'Accommodations') {
    retrieveAccommodations();
    retrieveCategoryNames();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(() => {
  if (selectedTab.value === 'Semesters') {
    retrieveSemesters();
  } else if (selectedTab.value === 'Categories') {
    retrieveAccommodationCategories();
  } else if (selectedTab.value === 'Accommodations') {
    retrieveAccommodations();
    retrieveCategoryNames();
  }
});

</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>Management Dashboard</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="Categories">Accommodation Categories</v-tab>
            <v-tab value="Accommodations">Accommodations</v-tab>
            <v-tab value="Semesters">Semesters</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">

          <!-- Categories Section -->
          <div v-if="selectedTab === 'Categories'">
            <v-card>
              <v-card-title>
                Accommodation Categories
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showAddCategoryDialog = true">
                    Add New Category
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in accommodationCategories" :key="item.id">
                      <td>{{ item.id }}</td>
                      <td>{{ item.categoryName }}</td>
                      <td>{{ item.desc }}</td>
                      <td>
                        <v-btn icon @click="editCategory(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteCategory(item.id)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <!-- Accommodations Section -->
          <div v-if="selectedTab === 'Accommodations'">
            <v-card>
              <v-card-title>
                Accommodations
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showAddAccommodationDialog = true; selectedCategoryName = '';">
                  Add New Accommodation
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Accommodation Name</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in accommodations" :key="item.id">
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>{{ item.accommodationCategory?.categoryName }}</td>
                      <td>
                        <v-btn icon @click="editAccommodation(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteAccommodation(item.id)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <!-- Semesters Section -->
          <div v-if="selectedTab === 'Semesters'">
            <v-card>
              <v-card-title>
                Semesters
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showAddSemesterDialog = true">
                    Add New Semester
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in semesters" :key="item.id">
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>{{ formatDateForDisplay(item.startDate) }}</td>
                      <td>{{ formatDateForDisplay(item.endDate) }}</td>
                      <td>
                        <v-btn icon @click="editSemester(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteSemester(item.id)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
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
          {{ editingCategory ? 'Edit' : 'Add' }} Category
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
          <v-btn color="red darken-1" text @click="showAddCategoryDialog = false">Cancel</v-btn>
          <v-btn color="green darken-1" :disabled="!validCategory" @click="saveCategory(newCategory)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Accommodation Dialog -->
    <v-dialog v-model="showAddAccommodationDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingAccommodation ? 'Edit' : 'Add' }} Accommodation</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Accommodation Title"
                  v-model="newAccommodation.title"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="Category"
                  :items="accommodationCategories"
                  v-model="selectedCategoryName"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeAccommodationDialog">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveAccommodation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Add/Edit Semester Dialog -->
    <v-dialog v-model="showAddSemesterDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingSemester ? 'Edit' : 'Add' }} Semester</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Semester Title"
                  v-model="newSemester.title"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Start Date"
                  v-model="newSemester.startDate"
                  type="date"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="End Date"
                  v-model="newSemester.endDate"
                  type="date"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeSemesterDialog">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveSemester">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </div>
  </template>
  