<script setup>
import { ref, watch, computed, onMounted } from "vue";
import userServices from "../services/userServices";
import userRoleServices from "../services/userRoleServices";
import { useStore } from "vuex";

// Refs for Users tab
const users = ref([]);
const userRoles = ref([]);
const roleNames = ref([]);
const roleNameToIdMap = ref({});
const changedUserRoles = ref({});
const snackbar = ref(false);
const snackbarText = ref("");

// Refs for User Roles tab
const roles = ref([]);
const newUserRole = ref({ name: "" });
const editingUserRole = ref(false);
const showAddUserRoleDialog = ref(false);
const validUserRole = ref(false);
const rules = {
  required: (value) => !!value || "Required.",
  maxNameLength: (value) => value.length <= 40 || "Name cannot exceed 40 characters",
};

// Refs for general use
const selectedTab = ref("Users");
const isUsersTabActive = computed(() => selectedTab.value === "Users");
const isUserRolesTabActive = computed(() => selectedTab.value === "User Roles");
const isDevToolsTabActive = computed(() => selectedTab.value === "Dev Tools");
const store = useStore(); // Use the store
const isDev = computed(() => store.getters.isDev);
const itemToDelete = ref(null);
const showDeleteConfirmDialog = ref(false);

// User Roles Section

const fetchUsersAndRoles = async () => {
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      userServices.getAll(),
      userRoleServices.getAll(),
    ]);

    users.value = usersResponse.data;
    userRoles.value = rolesResponse.data;

    roleNames.value = rolesResponse.data.map((role) => role.name);
    roleNameToIdMap.value = rolesResponse.data.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});

    // Initialize each user's selectedRoleName with their current role name
    users.value = users.value.map((user) => {
      const userRole = userRoles.value.find(
        (role) => role.id === user.userRoleId
      );
      user.selectedRoleName = userRole ? userRole.name : null;
      return user;
    });
  } catch (error) {
    console.error("Failed to fetch users or roles:", error);
  }
};

// Batch update function
const saveAllUserRoleChanges = async () => {
  const updatePromises = Object.entries(changedUserRoles.value).map(
    ([userId, roleId]) => userServices.updateRole(userId, roleId)
  );

  try {
    await Promise.all(updatePromises);
    snackbarText.value = "All user roles updated successfully";
    snackbar.value = true; // Show the snackbar
    fetchUsersAndRoles(); // Refresh data
    changedUserRoles.value = {}; // Reset changes tracker
  } catch (error) {
    console.error("Failed to update user roles:", error);
    snackbarText.value = "Failed to update user roles";
    snackbar.value = true; // Show the snackbar even in case of error
  }
};

// Computed property to check if there are changes
const hasChanges = computed(() => {
  return Object.keys(changedUserRoles.value).length > 0;
});

// Define headers for v-data-table.
const userHeaders = [
  { title: "Name", key: "fName" },
  { title: "Change Role", key: "changeRole", sortable: false },
];

// User Roles Section

const retrieveUserRoles = async () => {
  try {
    const response = await userRoleServices.getAll();
    roles.value = response.data;
  } catch (error) {
    console.error("Failed to retrieve user roles:", error);
  }
};

const editUserRole = (role) => {
  newUserRole.value = { ...role };
  editingUserRole.value = true;
  showAddUserRoleDialog.value = true;
};

const saveUserRole = async () => {
  if (editingUserRole.value && newUserRole.value.id) {
    // Update existing user role
    await userRoleServices.update(newUserRole.value.id, newUserRole.value);
    snackbarText.value = "Role updated successfully.";
  } else {
    // Add new user role
    await userRoleServices.create(newUserRole.value);
    snackbarText.value = "Role added successfully.";
  }
  snackbar.value = true; // Show the snackbar

  // Reset newUserRole to its initial state
  newUserRole.value = { name: "" };
  validUserRole.value = false; // Also reset form validation state
  editingUserRole.value = false; // Reset editing state

  showAddUserRoleDialog.value = false; // Close the dialog
  await retrieveUserRoles(); // Refresh the list of roles
};

const deleteUserRole = async (roleId) => {
  try {
    await userRoleServices.delete(roleId); // Use the delete method from your services
    snackbarText.value = "Role deleted successfully.";
    snackbar.value = true; // Show the snackbar
    await retrieveUserRoles(); // Refresh the list of roles after deletion
    showDeleteConfirmDialog.value = false; // Close the confirmation dialog
    itemToDelete.value = null; // Reset the itemToDelete
  } catch (error) {
    console.error(`Failed to delete role with ID ${roleId}:`, error);
    // Handle the error appropriately, e.g., showing an error message to the user
  }
};

const closeUserRoleDialog = () => {
  showAddUserRoleDialog.value = false;
  newUserRole.value = { name: "" }; // Reset the form
  editingUserRole.value = false; // Reset the editing state
};

// Define headers for v-data-table.
const userRoleHeaders = [
  { title: "Role Name", key: "name" },
  { title: "Actions", key: "actions", sortable: false },
];

// Misc Section

const openDeleteConfirmDialog = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value) {
    await deleteUserRole(itemToDelete.value.id);
    showDeleteConfirmDialog.value = false;
    itemToDelete.value = null; // Reset
  }
};

const resetForm = () => {
  newUserRole.value = { name: "" };
  validUserRole.value = false; // Reset validation state
  editingUserRole.value = false; // Ensure we're not in editing mode
};

// Watcher for the "Users" tab
watch(
  [users, isUsersTabActive],
  ([newUsers, isUsersActive]) => {
    if (isUsersActive) {
      newUsers.forEach((user) => {
        const selectedRoleId = roleNameToIdMap.value[user.selectedRoleName];
        if (selectedRoleId !== undefined) {
          if (selectedRoleId === user.userRoleId) {
            // If the selected role is the same as the original role, remove the change tracking for this user.
            if (changedUserRoles.value.hasOwnProperty(user.id)) {
              delete changedUserRoles.value[user.id];
            }
          } else {
            // Track the role change.
            changedUserRoles.value[user.id] = selectedRoleId;
          }
        }
      });
    }
  },
  { deep: true }
);

// Watcher for the "User Roles" tab
watch(isUserRolesTabActive, async (isActive) => {
  if (isActive) {
    await retrieveUserRoles();
  }
});

// Call this once to load the default tab's data when the component mounts
onMounted(async () => {
  await fetchUsersAndRoles();
  await retrieveUserRoles();
});
</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar>
            <v-toolbar-title>User Management</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="selectedTab" background-color="primary" dark>
            <v-tab value="Users">Users</v-tab>
            <v-tab value="User Roles">User Roles</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-fade-transition mode="out-in">
            <!-- Users Section -->
            <div v-if="selectedTab === 'Users'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Role Assignment</span>
                  <v-btn
                    color="saveblue"
                    @click="saveAllUserRoleChanges"
                    :disabled="!hasChanges"
                  >
                    Save All Changes
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="userHeaders"
                    :items="users"
                    item-key="id"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item="{ item }">
                      <tr>
                        <td>{{ item.fName }} {{ item.lName }}</td>
                        <td>
                          <v-select
                            v-model="item.selectedRoleName"
                            :items="roleNames"
                            label="Select Role"
                            class="select-fixed-width"
                          ></v-select>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </div>

            <!-- User Roles Section -->
            <div v-if="selectedTab === 'User Roles'">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>User Roles</span>
                  <v-btn
                    color="primary"
                    @click="
                      resetForm(),
                        (showAddUserRoleDialog = true),
                        (editingUserRole = false)
                    "
                  >
                    Add New Role
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="userRoleHeaders"
                    :items="roles"
                    item-key="id"
                    class="elevation-1"
                    :items-per-page="5"
                    :items-per-page-options="[5, 10, 15, 20]"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon @click="editUserRole(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon @click="() => openDeleteConfirmDialog(item)">
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

    <!-- Add/Edit User Role Dialog -->
    <v-dialog v-model="showAddUserRoleDialog" max-width="600px">
      <v-card>
        <v-card-title
          >{{ editingUserRole ? "Edit" : "Add" }} User Role</v-card-title
        >
        <v-card-text>
          <v-form ref="formUserRole" v-model="validUserRole">
            <v-text-field
              label="Role Name"
              v-model="newUserRole.name"
              :rules="[rules.required, rules.maxNameLength]"
              maxlength="40"
              counter
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="cancelgrey" text @click="closeUserRoleDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="saveblue"
            text
            :disabled="!validUserRole"
            @click="saveUserRole"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteConfirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text
          >Are you sure you want to delete this user role?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="cancelgrey"
            text
            @click="showDeleteConfirmDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" text @click="() => confirmDelete()"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
      <!-- <v-btn color="pink" text @click="snackbar = false">Close</v-btn> -->
    </v-snackbar>
  </div>
</template>
