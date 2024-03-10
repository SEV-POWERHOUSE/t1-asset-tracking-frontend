<script setup>
import { ref, toRefs, watch, onMounted } from "vue"
import ProfileDataServices from "../services/assetProfileServices"
import AssetProfileServices from "../services/assetProfileServices"
import AssetTypeServices from "../services/assetTypeServices"
import AssetCategoryServices from "../services/assetCategoryServices";

const message = ref("")
const validProfile = ref(false);
const assetCategories = ref([]);
const assetTypes = ref([]);
const selectedTypeId = ref("");

// Validation Rules
const rules = {
  required: (value) => !!value || "Required.",
  maxDescLength: (value) => value.length <= 255,
  maxNameLength: (value) => value.length <= 50,
  serialNumberLength: (value) => value.length <= 20,
}

const emit = defineEmits(['closeDialog'])

// Receive props from AssetManage
const props = defineProps({
    editingProfile: {
        required: false,
        default: false
    },
    sendEditProfile: {
        type: Function,
        required: true
    },
    selectedProfile: {
        required: false
    }
})

// Deconstruct props => refs
const { editingProfile, selectedProfile } = toRefs(props)

const newProfile = ref({
  profileName: "",
  desc: "",
  typeId: "",
});

const newData = ref({
    field: "",
    data: "",
    profileId: "",
})

const handleSendEditProfile = () => {
    props.sendEditProfile(props.profile);
};

// Retrieve Categories from Database
const retrieveAssetCategories = async () => {
  try {
    const response = await AssetCategoryServices.getAll();
    assetCategories.value = response.data.map((category) => ({
      title: category.categoryName,
      key: category.categoryId,
      description: category.desc,
      activeStatus: category.activeStatus,
    }));
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

// Retrieve Types from Database
const retrieveAssetTypes = async () => {
  try {
    // Assuming you've already fetched categories at this point
    const typesResponse = await AssetTypeServices.getAll()
    const enrichedTypes = typesResponse.data.map((type) => {
      // Find the category for each type
      const category = assetCategories.value.find(
        (c) => c.key === type.categoryId
      )
      return {
        ...type,
        categoryName: category ? category.title : "Unknown Category", // Enriching type with category name
        key: type.typeId, // Keeping your original key assignment
        title: type.typeName, // Assuming you're mapping typeName to title
        description: type.desc, // Direct mapping
        activeStatus: type.activeStatus,
        categoryId: type.categoryId,
      }
    })
    assetTypes.value = enrichedTypes
  } catch (error) {
    console.error("Error loading types:", error)
    message.value = "Failed to load types."
  }
}

// Retrieve ProfileData from Database
const retrieveProfileData = async () => {
  try {
    const response = await ProfileDataServices.getAll()
    profileData.value = response.data.map((data) => {
      return {
        ...data,
        key: data.profileDataId,
        title: data.field,
      }
    })
  } catch (error) {
    console.error("Error loading profile data:", error)
    message.value = "Failed to load profile data."
  }
}

// Save profile (add or edit)
const saveProfile = async () => {
  const profileData = {
    profileName: newProfile.value.profileName,
    desc: newProfile.value.desc,
    typeId: selectedTypeId.value.key,
  }

  try {
    // Check if editing an existing profile (i.e., `id` is present)
    if (editingProfile.value && newProfile.value.id) {
      // Call update service if editing
      await AssetProfileServices.update(newProfile.value.id, profileData)
      snackbarText.value = "Profile updated successfully."
    } else {
      // Call create service if adding a new profile
      await AssetProfileServices.create(profileData)
      snackbarText.value = "Profile added successfully."
    }
    snackbar.value = true // Show the snackbar
    message.value = "Profile saved successfully."
    await retrieveAssetProfiles()
  } catch (error) {
    console.error("Error saving profile:", error)
    message.value = `Error saving profile: ${error.message || "Unknown error"}`
  } finally {
    resetProfileForm()
    showAddProfileDialog.value = false
  }
}

// Edit profile
const editProfile = () => {
    console.log("Passed in profile: ", selectedProfile.value)
    if (props.selectedProfile) {
        // Assign existing profile's properties, including its unique identifier
        newProfile.value = {
            ...props.selectedProfile,
            id: props.selectedProfile.profileId, // Adjust according to how profile IDs are named in your data
        }
        selectedTypeId.value = props.selectedProfile.typeId
    }
}

// Function to populate text field with data from formData
const populateTextField = (label) => {
    if (formData.value[label]) {
        textFieldValue.value = formData.value[label]
    } else {
        textFieldValue.value = '' // Clear the text field if no data found
    }
}

const emitCloseDialog = () => {
    emit('closeDialog')
}

onMounted(() => {
    // populateTextField('Manufacturer') // Adjust the label as needed
    retrieveProfileData()
    retrieveAssetTypes()
    retrieveAssetCategories()

    console.log("editingProfile: ", editingProfile.value)
})

// Watcher Functions
// Watch for changes in selectedProfile prop
watch(() => props.selectedProfile, (newValue) => {
    if (newValue && editingProfile.value) {
        editProfile(newValue);
    }
});


// Debug helper
const debugComment = () => {
    console.log("Entered template. editingProfile:", editingProfile.value)
}
</script>

<template>
    <v-card>
        <v-card-title>
            <span class="headline"
            >{{ editingProfile ? "Edit" : "Add" }} Profile</span
            >
        </v-card-title>
        <v-card-text>
            <v-form ref="formProfile" v-model="validProfile">
            <v-container>
                <v-row>
                <v-col cols="12">
                    <v-text-field
                    label="Profile Name"
                    v-model="newProfile.profileName"
                    :rules="[rules.required, rules.maxNameLength]"
                    maxlength="50"
                    counter
                    ></v-text-field>
                </v-col>
                <v-col cols="12">
                    <!-- Asset Type Selection -->
                    <v-autocomplete
                    label="Type"
                    :items="assetTypes"
                    item-text="title"
                    item-value="key"
                    v-model="selectedTypeId"
                    :rules="[rules.required]"
                    clearable
                    return-object
                    ></v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Description"
                    v-model="newProfile.desc"
                    :rules="[rules.required, rules.maxDescLength]"
                    maxlength="255"
                    counter
                  ></v-text-field>
                </v-col>
                </v-row>
            </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="cancelgrey" text @click="emitCloseDialog"
            >Cancel</v-btn
            >
            <v-btn color="saveblue" @click="saveProfile" :disabled="!validProfile"
            >Save</v-btn
            >
        </v-card-actions>
    </v-card>
</template>


<!-- Love, Zane -->