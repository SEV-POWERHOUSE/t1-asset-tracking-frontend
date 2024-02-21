<script setup>
import { ref, onMounted, watch } from 'vue';
import userServices from '../services/userServices';
import userGroupServices from '../services/userGroupServices';

const users = ref([]);
const userGroups = ref([]);
const groupNames = ref([]);
const groupNameToIdMap = ref({});
const changedUserGroups = ref({});


const fetchUsersAndGroups = async () => {
  try {
    const [usersResponse, groupsResponse] = await Promise.all([
      userServices.getAll(),
      userGroupServices.getAll(),
    ]);

    users.value = usersResponse.data;
    userGroups.value = groupsResponse.data;

    groupNames.value = groupsResponse.data.map(group => group.name);
    groupNameToIdMap.value = groupsResponse.data.reduce((map, group) => {
      map[group.name] = group.id;
      return map;
    }, {});
  } catch (error) {
    console.error('Failed to fetch users or groups:', error);
  }
};

onMounted(fetchUsersAndGroups);

// const updateUserGroup = async (user, groupName) => {
//   const groupId = groupNameToIdMap.value[groupName];
//   if (!groupId) {
//     console.error('Group ID not found for selected group');
//     return;
//   }

//   try {
//     await userServices.updateGroup(user.id, groupId);
//     console.log('User group updated successfully');
//     fetchUsersAndGroups();
//   } catch (error) {
//     console.error('Failed to update user group:', error);
//   }
// };

// Define headers for v-data-table.
const headers = [
  { title: 'Name', key: 'fName' },
  { title: 'Group', key: 'userGroup.name' },
  { title: 'Change Group', key: 'changeGroup', sortable: false },
];

// Batch update function
const saveAllUserGroupChanges = async () => {
  const updatePromises = Object.entries(changedUserGroups.value).map(([userId, groupId]) =>
    userServices.updateGroup(userId, groupId)
  );

  try {
    await Promise.all(updatePromises);
    console.log('All user groups updated successfully');
    fetchUsersAndGroups(); // Refresh data
    changedUserGroups.value = {}; // Reset changes tracker
  } catch (error) {
    console.error('Failed to update user groups:', error);
  }
};

// Watcher to track group changes
watch(users, (newUsers) => {
  newUsers.forEach(user => {
    if (user.selectedGroupName && groupNameToIdMap.value[user.selectedGroupName] !== user.userGroupId) {
      changedUserGroups.value[user.id] = groupNameToIdMap.value[user.selectedGroupName];
    }
  });
}, { deep: true });
</script>

<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>Group Assignment</v-card-title>
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
                  {{ userGroups.find(group => group.id === item.userGroupId)?.name}}
                </td>
                <td>
                  <v-select
                    v-model="item.selectedGroupName"
                    :items="groupNames"
                    label="Select Group"
                  ></v-select>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-text>
          <v-btn color="secondary" @click="saveAllUserGroupChanges">Save All Changes</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>