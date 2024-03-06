<script setup>
import PersonServices from "../services/personServices";
import { ref, onMounted, watch, computed } from "vue";

const message = ref("");
const selectedTab = ref("People");
const selectedStatus = ref("Active");
const people = ref([]);
const showAddPersonDialog = ref(false);
const editingPerson = ref(false);
const validPerson = ref(false);
const showDeleteConfirmDialog = ref(false);
const showArchiveDialog = ref(false);
const showActivateDialog = ref(false);
const itemToDelete = ref(null);
const itemToArchive = ref(null);
const itemToActivate = ref(null);
const snackbar = ref(false);
const snackbarText = ref("");
const personSortBy = ref([{ key: "title", order: "asc" }]);
const rules = {
  required: (value) => !!value || "Required.",
  maxNameLength: (value) =>
    value.length <= 40 || "Name cannot exceed 40 characters",
  maxCounter: (value) => value.length <= 7,
  minCounter: (value) =>
    value.length >= 7 || "ID number must be 7 numbers long",
  idNumber: (value) =>
    /^[0-9]{7}$/.test(value) || "ID number must contain only numbers",
  email: (value) => {
    const pattern = /^[a-zA-Z]+(?:\.[a-zA-Z]+)?@(?:eagles\.)?oc\.edu$/;
    return pattern.test(value) || "e-mail must be eagles.oc.edu or oc.edu.";
  },
};
const newPerson = ref({
  title: "",
  lName: "",
  email: "",
  idNumber: "",
});

// People Section

// Retrieve People from Database
const retrievePeople = async () => {
  try {
    const response = await PersonServices.getAll();
    people.value = response.data.map((person) => ({
      title: person.fName,
      key: person.personId,
      lName: person.lName,
      email: person.email,
      idNumber: person.idNumber,
      activeStatus: person.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading people:", error);
  }
  console.log(people.value);
};

const editPerson = async (person) => {
  newPerson.value = {
    title: person.title,
    lName: person.lName,
    email: person.email,
    idNumber: person.idNumber,
    personId: person.key,
  };
  editingPerson.value = true;
  showAddPersonDialog.value = true;
};

const savePerson = async () => {
  const personData = {
    fName: newPerson.value.title,
    lName: newPerson.value.lName,
    email: newPerson.value.email,
    idNumber: newPerson.value.idNumber,
  };

  try {
    let response;
    if (editingPerson.value) {
      // Assuming your API expects an ID and the updated data for people updates
      response = await PersonServices.update(
        newPerson.value.personId,
        personData
      );
      snackbarText.value = "Person updated successfully.";
    } else {
      response = await PersonServices.create(personData);
      snackbarText.value = "Person added successfully.";
    }
    snackbar.value = true; // Show the snackbar
    message.value = "Person saved successfully.";
    retrievePeople(); // Refresh people list
  } catch (error) {
    console.error("Error saving person:", error);
    message.value = `Error saving person: ${error.message || "Unknown error"}`;
  } finally {
    editingPerson.value = false;
    showAddPersonDialog.value = false;
    newPerson.value = { title: "", lName: "", email: "", idNumber: "" }; // Reset the form
  }
};

const deletePerson = async (personId) => {
  try {
    await PersonServices.delete(personId);
    snackbarText.value = "Person deleted successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of people after successful deletion
    retrievePeople();
    people.value = people.value.filter((t) => t.personId !== personId);
  } catch (error) {
    console.error(error);
    message.value = "Error deleting person.";
  }
};

const closePersonDialog = () => {
  showAddPersonDialog.value = false;
  editingPerson.value = false;
  newPerson.value = { fName: "", lName: "", email: "", idNumber: "" };
};

const archivePerson = async (personId) => {
  const archiveData = {
    activeStatus: false, // The new value for the activeStatus field
  };
  try {
    await PersonServices.update(personId, archiveData);
    snackbarText.value = "Person archived successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of people after successful deletion
    retrievePeople();
    people.value = people.value.filter((c) => c.id !== personId);
  } catch (error) {
    console.error(error);
    message.value = "Error archiving person.";
  }
};

const activatePerson = async (personId) => {
  const activateData = {
    activeStatus: true, // The new value for the activeStatus field
  };
  try {
    await PersonServices.update(personId, activateData);
    snackbarText.value = "Person activated successfully.";
    snackbar.value = true; // Show the snackbar
    // Refresh the list of people after successful deletion
    retrievePeople();
    people.value = people.value.filter((c) => c.id !== personId);
  } catch (error) {
    console.error(error);
    message.value = "Error activating person.";
  }
};

const personHeaders = ref([
  { title: "First Name", key: "title" },
  { title: "Last Name", key: "lName" },
  { title: "Email", key: "email" },
  { title: "ID", key: "idNumber" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Archive", key: "archive", sortable: false },
]);

const archivedPersonHeaders = ref([
  { title: "First Name", key: "title" },
  { title: "Last Name", key: "lName" },
  { title: "Email", key: "email" },
  { title: "ID", key: "idNumber" },
  { title: "Edit", key: "edit", sortable: false },
  { title: "Activate", key: "activate", sortable: false },
  { title: "Delete", key: "delete", sortable: false },
]);

const filteredPeople = computed(() => {
  if (selectedStatus.value === "Active") {
    return people.value.filter((people) => people.activeStatus === true);
  } else if (selectedStatus.value === "Archived") {
    return people.value.filter((people) => people.activeStatus === false);
  } else {
    return people.value;
  }
});

// Misc Section
const openDeleteConfirmDialog = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value.type === "person") {
    await deletePerson(itemToDelete.value.id);
  }
  showDeleteConfirmDialog.value = false;
  itemToDelete.value = null; // Reset after deletion
};

const openArchiveDialog = (item) => {
  itemToArchive.value = item;
  showArchiveDialog.value = true;
};

const confirmArchive = async () => {
  if (itemToArchive.value.type === "person") {
    await archivePerson(itemToArchive.value.id);
  }
  showArchiveDialog.value = false;
  itemToArchive.value = null; // Reset after deletion
};

const openActivateDialog = (item) => {
  itemToActivate.value = item;
  showActivateDialog.value = true;
};

const confirmActivate = async () => {
  if (itemToActivate.value.type === "person") {
    await activatePerson(itemToActivate.value.id);
  }
  showActivateDialog.value = false;
  itemToActivate.value = null; // Reset after deletion
};

// Watch for changes on selectedTab and fetch data accordingly
watch(selectedTab, (newValue) => {
  if (newValue === "People") {
    retrievePeople();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await retrievePeople();
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
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="People" color="primary">People</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <!-- Introducing a spacer row for visual separation -->
      <v-row class="my-1"></v-row>
      <!-- Adjust 'my-3' class for desired spacing -->

      <v-row>
        <v-col cols="12">
          <v-tabs v-model="selectedStatus" background-color="primary" dark>
            <v-tab value="Active" color="primary">Active</v-tab>
            <v-tab value="Inactive" color="primary">Archived</v-tab>
          </v-tabs>
        </v-col>
      </v-row>


      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Active People Section -->
            <div v-if="selectedTab === 'People' && selectedStatus === 'Active'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Active People</span>
                  <v-btn color="primary" @click="showAddPersonDialog = true">
                    Add New Person
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personHeaders"
                    :items="filteredPeople"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="personSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editPerson(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.archive="{ item }">
                      <v-btn
                        icon
                        @click="
                          openArchiveDialog({
                            id: item.key,
                            type: 'person',
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
            <!-- Archived People Section -->
            <div
              v-if="selectedTab === 'People' && selectedStatus === 'Archived'"
            >
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Archived People</span>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="archivedPersonHeaders"
                    :items="filteredPeople"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 20, 50, -1]"
                    v-model:sort-by="personSortBy"
                  >
                    <template v-slot:item.edit="{ item }">
                      <v-btn icon @click="editPerson(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:item.activate="{ item }">
                      <v-btn
                        icon
                        @click="
                          openActivateDialog({
                            id: item.key,
                            type: 'person',
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
                            type: 'person',
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

    <!-- Add/Edit Person Dialog -->
    <v-dialog v-model="showAddPersonDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ editingPerson ? "Edit" : "Add" }} Person</span
          >
        </v-card-title>
        <v-card-text>
          <v-form ref="formPerson" v-model="validPerson">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="First Name"
                    v-model="newPerson.title"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="40"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Last Name"
                    v-model="newPerson.lName"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="40"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Email"
                    v-model="newPerson.email"
                    placeholder="first.last@oc.edu or first.last@eagles.oc.edu"
                    :rules="[rules.required, rules.email]"
                    maxlength="40"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="ID No."
                    v-model="newPerson.idNumber"
                    hint="Please enter your 7 digit ID number"
                    :rules="[
                      rules.required,
                      rules.maxCounter,
                      rules.minCounter,
                      rules.idNumber,
                    ]"
                    maxlength="7"
                    counter
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closePersonDialog"
            >Cancel</v-btn
          >
          <v-btn color="saveblue" @click="savePerson" :disabled="!validPerson"
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
