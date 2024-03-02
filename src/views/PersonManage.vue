<script setup>
import PersonServices from "../services/personServices";
import { ref, onMounted, watch } from "vue";

const message = ref("");
const selectedTab = ref("People");
const people = ref([]);
const showAddPersonDialog = ref(false);
const editingPerson = ref(false);
const validPerson = ref(false);
const showDeleteConfirmDialog = ref(false);
const itemToDelete = ref(null);
const snackbar = ref(false);
const snackbarText = ref("");
const rules = {
  required: (value) => !!value || "Required.",
  maxNameLength: (value) => value.length <= 40 || "Name cannot exceed 40 characters",
  maxCounter: (value) => value.length <= 7,
  minCounter: (value) => value.length >= 7 || "ID number must be 7 numbers long",
  idNumber: (value) => /^[0-9]{7}$/.test(value) || "ID number must contain only numbers",
  email: value => {
            const pattern =
              /^[a-zA-Z]+(?:\.[a-zA-Z]+)?@(?:eagles\.)?oc\.edu$/
            return pattern.test(value) || 'e-mail must be eagles.oc.edu or oc.edu.'
  }
};

const newPerson = ref({
  title: "",
  lName: "",
  email: "",
  idNumber: "",
});

// People Section

// Retrieve Buildings from Database
const retrievePeople = async () => {
  try {
    const response = await PersonServices.getAll();
    people.value = response.data.map((person) => ({
      title: person.fName,
      key: person.personId,
      lName: person.lName,
      email: person.email,
      idNumber: person.idNumber,
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
    // Refresh the list of buildings after successful deletion
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

const personHeaders = ref([
  { title: "First Name", key: "title" },
  { title: "Last Name", key: "lName"},
  { title: "Email", key: "email"},
  { title: "ID", key: "idNumber"},
  { title: "Actions", key: "actions", sortable: false },
]);

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
            <v-toolbar-title>People Management</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="People">People</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- People Section -->
            <div v-if="selectedTab === 'People'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>People</span>
                  <v-btn color="primary" @click="showAddPersonDialog = true">
                    Add New Person
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="personHeaders"
                    :items="people"
                    item-key="key"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editPerson(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
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
                    maxlength="80"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Last Name"
                    v-model="newPerson.lName"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="80"
                    counter
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Email"
                    v-model="newPerson.email"
                    placeholder="first.last@oc.edu or first.last@eagles.oc.edu"
                    :rules="[rules.required, rules.email]"
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
                      rules.idNumber
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
    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
      <!-- <v-btn color="pink" text @click="snackbar = false">Close</v-btn> -->
    </v-snackbar>
  </div>
</template>
