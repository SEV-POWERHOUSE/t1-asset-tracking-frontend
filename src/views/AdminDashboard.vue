<script setup>
import { ref, onMounted } from "vue";
import userServices from "../services/userServices";
import userGroupServices from "../services/userGroupServices";

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

    groupNames.value = groupsResponse.data.map((group) => group.name);
    groupNameToIdMap.value = groupsResponse.data.reduce((map, group) => {
      map[group.name] = group.id;
      return map;
    }, {});
  } catch (error) {
    console.error("Failed to fetch users or groups:", error);
  }
};

onMounted(fetchUsersAndGroups);

const updateUserGroup = async (user, groupName) => {
  const groupId = groupNameToIdMap.value[groupName];
  if (!groupId) {
    console.error("Group ID not found for selected group");
    return;
  }

  try {
    await userServices.updateGroup(user.id, groupId);
    console.log("User group updated successfully");
    // You might need to re-fetch the user data here to reflect the changes
  } catch (error) {
    console.error("Failed to update user group:", error);
  }
};
</script>

<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>Admin Dashboard</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">User ID</th>
                <th class="text-left">Name</th>
                <th class="text-left">Group</th>
                <th class="text-left">Change Group</th>
                <th class="text-left">Save</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.fName }} {{ user.lName }}</td>
                <td>
                  {{
                    userGroups.find((group) => group.id === user.userGroupId)
                      ?.name || "No Group"
                  }}
                </td>
                <td>
                  <v-select
                    v-model="user.selectedGroupName"
                    :items="groupNames"
                    label="Select Group"
                  ></v-select>
                </td>
                <td>
                  <v-btn
                    color="primary"
                    @click="updateUserGroup(user, user.selectedGroupName)"
                    >Save</v-btn
                  >
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
