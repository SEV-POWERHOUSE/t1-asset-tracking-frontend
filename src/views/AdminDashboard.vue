<script setup>
import { ref, onMounted } from 'vue';
import userServices from '../services/userServices';
import userGroupServices from '../services/userGroupServices';

const users = ref([]);
const userGroups = ref([]);
const groupNames = ref([]);
const groupNameToIdMap = ref({});

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

const updateUserGroup = async (user, groupName) => {
  const groupId = groupNameToIdMap.value[groupName];
  if (!groupId) {
    console.error('Group ID not found for selected group');
    return;
  }

  try {
    await userServices.updateGroup(user.id, groupId);
    console.log('User group updated successfully');
    fetchUsersAndGroups();
  } catch (error) {
    console.error('Failed to update user group:', error);
  }
};

// Define headers for v-data-table. Currently not working
const headers = [
  { text: 'Name', value: 'fName' },
  { text: 'Group', value: 'group' },
  { text: 'Change Group', value: 'changeGroup', sortable: false },
  { text: 'Save', value: 'actions', sortable: false },
];
</script>

<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>Admin Dashboard</v-card-title>
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
                  {{ userGroups.find(group => group.id === item.userGroupId)?.name || 'No Group' }}
                </td>
                <td>
                  <v-select
                    v-model="item.selectedGroupName"
                    :items="groupNames"
                    label="Select Group"
                  ></v-select>
                </td>
                <td>
                  <v-btn color="primary" @click="updateUserGroup(item, item.selectedGroupName)">Save</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>