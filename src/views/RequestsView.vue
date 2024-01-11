<script setup>
import UserAccommodationRequestServices from "../services/userAccommodationRequestServices";
import UserAccommodationServices from "../services/userAccommodationServices";
import AccommodationCategoryServices from "../services/accommodationCategoryServices";
import AccommodationServices from "../services/accommodationServices";
import NotificationSender from "../components/NotificationSender.vue";
import Utils from "../config/utils.js";
import { ref, onMounted, watch, watchEffect, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userAccommodationRequest = ref({});
const accommodationCategories = ref([]);
const accommodations = ref([]);
const filteredAccommodations = ref([]);
const selectedAccommodations = ref([]);
const selectedCategory = ref(null);
const notificationSender = ref(null);
const user = Utils.getStore("user");
const message = ref("View and approve accommodations");
const dialogMessage = ref("Are you sure you want to proceed with the approval of the selected accommodation(s)?");
const approveDialog = ref(false);
const declineDialog = ref(false);
const isApprovalProcessCompleted = ref(false);

const props = defineProps({
  id: {
    required: true,
  },
});

const retrieveUserAccommodationRequests = () => {
  UserAccommodationRequestServices.get(props.id)
    .then((response) => {
      userAccommodationRequest.value = response.data;
    })
    .catch((e) => {
      message.value = e.response.data.message;
    });
};

// Function to retrieve accommodations based on the selected category name
const retrieveAccommodations = async () => {
  if (!selectedCategory.value) {
    filteredAccommodations.value = [];
    return;
  }

  try {
    // First, get the category ID by the category name
    const categoryResponse = await AccommodationCategoryServices.getByCategoryName(selectedCategory.value);
    const categoryId = categoryResponse.data.length > 0 ? categoryResponse.data[0].id : null;

    if (!categoryId) {
      throw new Error(`Category with name ${selectedCategory.value} not found.`);
    }

    // Then, get accommodations by the category ID
    const accommodationsResponse = await AccommodationServices.getAllByCategoryId(categoryId);
    filteredAccommodations.value = accommodationsResponse.data;
  } catch (error) {
    console.error(error);
    message.value = "Failed to load accommodations for the selected category.";
  }
};

// Add a method to toggle accommodation selection
const toggleAccommodationSelection = (accommodationId) => {
  const index = selectedAccommodations.value.indexOf(accommodationId);
  if (index > -1) {
    selectedAccommodations.value.splice(index, 1); // Remove if already selected
  } else {
    selectedAccommodations.value.push(accommodationId); // Add if not selected
  }
};

// Function to retrieve accommodation categories and extract their names
const retrieveCategoryNames = async () => {
  try {
    const response = await AccommodationCategoryServices.getAll();
    accommodationCategories.value = response.data.map(category => category.categoryName);
  } catch (error) {
    console.error(error);
    message.value = "Failed to load categories.";
  }
};

const toggleCategorySelection = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1); // Remove if already selected
  } else {
    selectedCategories.value.push(categoryId); // Add if not selected
  }
};

const updateStatus = (newStatus) => {
  return UserAccommodationRequestServices.update(userAccommodationRequest.value.id, { status: newStatus })
    .then(() => {
      message.value = `Accommodation has been ${newStatus}.`;
      return retrieveUserAccommodationRequests(); // Return this promise if it's async
    })
    .catch((e) => {
      message.value = e.response.data.message || `Failed to update accommodation status to ${newStatus}.`;
      throw e; // Re-throw the error to be caught by the caller
    });
};

const resetDialogMessage = () => {
  dialogMessage.value = "Are you sure you want to proceed with the approval of the selected accommodation(s)?";
};

const isApproveButtonDisabled = computed(() => {
  return selectedAccommodations.value.length === 0;
});

const confirmApprove = () => {
  if (!selectedAccommodations.value || selectedAccommodations.value.length === 0) {
    dialogMessage.value = "No accommodations selected. Please select accommodations before proceeding.";
    console.error("No accommodations selected.");
    return;
  }

  isApprovalProcessCompleted.value = true;

  // Wrap the creation of user accommodations in a Promise.all to handle them concurrently
  Promise.all(selectedAccommodations.value.map(accommodationId => {
    // Find the accommodation by ID to get the corresponding category ID
    const accommodation = filteredAccommodations.value.find(acc => acc.id === accommodationId);
    if (!accommodation || !accommodation.accommodationCategoryId) {
      throw new Error('Accommodation not found or missing category ID');
    }
    
    // Construct the accommodation data for each selected accommodation
    const accommodationData = {
      userId: userAccommodationRequest.value.userId,
      userAccommodationRequestId: userAccommodationRequest.value.id,
      description: userAccommodationRequest.value.description,
      permission: userAccommodationRequest.value.permission,
      semesterId: userAccommodationRequest.value.semesterId,
      accommodationCategoryId: accommodation.accommodationCategoryId,
      accommodationId: accommodationId,
    };

    // Call your API to create a UserAccommodation for each selected accommodation
    return UserAccommodationServices.create(accommodationData);
  }))
  .then(() => {
    // After successfully creating accommodations, update the request status to 'Approved'
    return updateStatus('Approved');
  })
  .then(() => {
    // Handle the successful approval
    message.value = "The accommodation request has been approved and accommodations have been created.";
    approveDialog.value = false;
    selectedAccommodations.value = []; // Clear the selected accommodations
    
    //Send approval email
    if (notificationSender.value) {
      notificationSender.value.sendEmail({
        from: user.email,
        to: userAccommodationRequest.value.user?.email,
      }, 'approve');
    } else {
      console.error('NotificationSender component not referenced properly.');
    }

    retrieveUserAccommodationRequests(); // Refresh the request data
  })
  .catch((error) => {
    console.error(error);
    message.value = "Failed to approve the accommodation request. " + error.message;
  });
};

const confirmDecline = () => {
  updateStatus('Declined')
    .then(() => {
      // After updating the status, close the dialog and clear any potentially selected accommodations
      declineDialog.value = false;
      selectedAccommodations.value = [];

      //Send denial email
      if (notificationSender.value) {
        notificationSender.value.sendEmail({
          from: user.email,
          to: userAccommodationRequest.value.user?.email,
        }, 'deny');
      } else {
        console.error('NotificationSender component not referenced properly.');
      }
    })
    .catch((error) => {
      // Handle any errors here
      console.error(error);
      message.value = "Failed to decline the accommodation request.";
    });
};

// Watcher to react to changes in the selected category
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    retrieveAccommodations();
  }
});

watchEffect(() => {
  if (isApprovalProcessCompleted.value) return;

  if (!selectedCategory.value) {
    message.value = "No category selected. Please select a category.";
    dialogMessage.value = "No category selected. Please select a category before proceeding.";
  } else if (!selectedAccommodations.value || selectedAccommodations.value.length === 0) {
    message.value = "No accommodations selected. Please select accommodations.";
    dialogMessage.value = "No accommodations selected. Please select accommodations before proceeding.";
  } else {
    message.value = "Approve or Decline Accommodation Requests";
    dialogMessage.value = "Are you sure you want to proceed with the approval of the selected accommodations?";
  }
});

onMounted(() => {
  retrieveUserAccommodationRequests();
  retrieveCategoryNames();});
  
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ user.fName }} {{ user.lName }}!</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title>Request View</v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Request ID</th>
              <th class="text-left">Semester</th>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ userAccommodationRequest.id }}</td>
              <td>{{ userAccommodationRequest.semester?.title }}</td> <!-- Corrected this line -->
              <td>{{ userAccommodationRequest.user?.fName }} {{ userAccommodationRequest.user?.lName }}</td>
              <td>{{ userAccommodationRequest.description }}</td>
              <td>{{ userAccommodationRequest.status }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Filter Accommodations by Category -->
      <v-card>
        <v-card-title>Filter Accommodations by Category</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedCategory"
            :items="accommodationCategories"
            label="Select Category"
            @change="retrieveAccommodations"
          ></v-select>
        </v-card-text>
      </v-card>

      <!-- List Accommodations with Checkboxes based on the selected Category -->
      <v-card>
        <v-card-title>Add Accommodations</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="accommodation in filteredAccommodations"
              :key="accommodation.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-checkbox
                :label="accommodation.title"
                :value="accommodation.id"
                :input-value="selectedAccommodations.includes(accommodation.id)"
                @change="toggleAccommodationSelection(accommodation.id)"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>


      <!-- Approval and Decline Actions -->
      <v-card>
        <v-card-text class="text-center">
          <v-btn color="green" @click="approveDialog = true" class="mx-4" small>Approve</v-btn>
          <v-btn color="red" @click="declineDialog = true" class="mx-4" small>Decline</v-btn>
        </v-card-text>
      </v-card>

      <!-- Decline Confirmation Dialog -->
      <v-dialog v-model="declineDialog" persistent max-width="300px">
        <v-card>
          <v-card-title class="text-h5">Confirm Decline</v-card-title>
          <v-card-text>Are you sure you want to decline this accommodation request?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="declineDialog = false">Cancel</v-btn>
            <v-btn color="red" text @click="confirmDecline">Decline</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Approve Confirmation Dialog -->
      <v-dialog v-model="approveDialog" persistent max-width="300px">
        <v-card>
          <v-card-title class="text-h5">Confirm Approval</v-card-title>
          <v-card-text>{{ dialogMessage }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="approveDialog = false; resetDialogMessage()">Cancel</v-btn>
            <v-btn
              color="green"
              @click="confirmApprove"
              :disabled="isApproveButtonDisabled"
              class="mx-4"
              small
            >
              Approve
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

<NotificationSender ref="notificationSender" />

  </div>
</template>
