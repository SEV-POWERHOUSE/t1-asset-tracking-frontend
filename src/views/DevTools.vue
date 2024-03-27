<script setup>
import { ref, onMounted, watch, computed } from "vue";
import userServices from "../services/userServices";
import userRoleServices from "../services/userRoleServices";

const users = ref([]);
const userRoles = ref([]);
const roleNames = ref([]);
const roleNameToIdMap = ref({});
const changedUserRoles = ref({});
const snackbar = ref(false);
const snackbarText = ref("");
const usersSortBy = ref([{ key: 'fName', order:'asc'}]);

// Define headers for v-data-table.
const headers = [
  { title: "Name", key: "fName" },
  { title: "Change Role", key: "changeRole", sortable: false },
];

const fetchDevUsersAndRoles = async () => {
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      userServices.getAll(),
      userRoleServices.getAll(),
    ]);

    userRoles.value = rolesResponse.data;

    roleNames.value = rolesResponse.data.map((role) => role.name);
    roleNameToIdMap.value = rolesResponse.data.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});

    // Filter users to only those with devPermission set to true
    users.value = usersResponse.data.filter(user => user.devPermission === true);

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
    fetchDevUsersAndRoles(); // Refresh data
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

// Watcher to track role changes
watch(
  users,
  (newUsers) => {
    newUsers.forEach((user) => {
      const selectedRoleId = roleNameToIdMap.value[user.selectedRoleName];
      if (selectedRoleId !== undefined) {
        if (selectedRoleId === user.userRoleId) {
          // If the selected role is the same as the original, remove from changedUserRoles
          if (changedUserRoles.value.hasOwnProperty(user.id)) {
            delete changedUserRoles.value[user.id];
          }
        } else {
          // Track the role change
          changedUserRoles.value[user.id] = selectedRoleId;
        }
      }
    });
  },
  { deep: true }
);

onMounted(fetchDevUsersAndRoles);
</script>

<template>
  <div>
    <v-container>
      <v-card class="elevation-1" style="max-width: 800px; margin: auto;">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Dev Tools</span>
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
            :headers="headers"
            :items="users"
            item-key="id"
            class="elevation-1"
            :items-per-page-options="[5, 10, 20, 50, -1]"
            v-model:sort-by="usersSortBy"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.fName }} {{ item.lName }}</td>
                <td>
                  <v-select
                    v-model="item.selectedRoleName"
                    :items="roleNames"
                    label="Select Role"
                    variant="solo"
                    class= "select-fixed-width"
                  ></v-select>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>
    <v-snackbar v-model="snackbar" :timeout="3000" class="custom-snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
