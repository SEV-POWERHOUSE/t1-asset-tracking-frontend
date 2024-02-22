<script setup>
import { ref, onMounted, watch } from 'vue';
import userServices from '../services/userServices';
import userRoleServices from '../services/userRoleServices';

const users = ref([]);
const userRoles = ref([]);
const roleNames = ref([]);
const roleNameToIdMap = ref({});
const changedUserRoles = ref({});


const fetchUsersAndRoles = async () => {
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      userServices.getAll(),
      userRoleServices.getAll(),
    ]);

    users.value = usersResponse.data;
    userRoles.value = rolesResponse.data;

    roleNames.value = rolesResponse.data.map(role => role.name);
    roleNameToIdMap.value = rolesResponse.data.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});
  } catch (error) {
    console.error('Failed to fetch users or roles:', error);
  }
};

onMounted(fetchUsersAndRoles);

// const updateUserRole = async (user, roleName) => {
//   const roleId = roleNameToIdMap.value[roleName];
//   if (!roleId) {
//     console.error('Role ID not found for selected role');
//     return;
//   }

//   try {
//     await userServices.updateRole(user.id, roleId);
//     console.log('User role updated successfully');
//     fetchUsersAndRoles();
//   } catch (error) {
//     console.error('Failed to update user role:', error);
//   }
// };

// Define headers for v-data-table.
const headers = [
  { title: 'Name', key: 'fName' },
  { title: 'Role', key: 'userRole.name' },
  { title: 'Change Role', key: 'changeRole', sortable: false },
];

// Batch update function
const saveAllUserRoleChanges = async () => {
  const updatePromises = Object.entries(changedUserRoles.value).map(([userId, roleId]) =>
    userServices.updateRole(userId, roleId)
  );

  try {
    await Promise.all(updatePromises);
    console.log('All user roles updated successfully');
    fetchUsersAndRoles(); // Refresh data
    changedUserRoles.value = {}; // Reset changes tracker
  } catch (error) {
    console.error('Failed to update user roles:', error);
  }
};

// Watcher to track role changes
watch(users, (newUsers) => {
  newUsers.forEach(user => {
    if (user.selectedRoleName && roleNameToIdMap.value[user.selectedRoleName] !== user.userRoleId) {
      changedUserRoles.value[user.id] = roleNameToIdMap.value[user.selectedRoleName];
    }
  });
}, { deep: true });
</script>

<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>Role Assignment</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="users"
            item-key="id"
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.fName }} {{ item.lName }}</td>
                <td>
                  {{ userRoles.find(role => role.id === item.userRoleId)?.name}}
                </td>
                <td>
                  <v-select
                    v-model="item.selectedRoleName"
                    :items="roleNames"
                    label="Select Role"
                  ></v-select>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-text>
          <v-btn color="secondary" @click="saveAllUserRoleChanges">Save All Changes</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>