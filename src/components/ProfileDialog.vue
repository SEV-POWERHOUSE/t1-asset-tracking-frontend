<script setup>
import { ref, toRefs, watch, onMounted, computed} from "vue"
import ProfileDataServices from "../services/profileDataServices"
import AssetProfileServices from "../services/assetProfileServices"
import AssetTypeServices from "../services/assetTypeServices"
import AssetCategoryServices from "../services/assetCategoryServices"

const message = ref("")
const validProfile = ref(false)
const assetCategories = ref([])
const assetTypes = ref([])
const selectedTypeId = ref("")
const snackbar = ref(false)
const snackbarText = ref("")
const generateDynamicFields = ref([])

// Validation Rules
const rules = {
  required: (value) => !!value || "Required.",
  maxNotesLength: (value) => value.length <= 255,
  maxFieldLength: (value) => value.length <= 50,
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
})

// The naming is confusing however newData is meant for the backend ProfileData object
const newData = ref({
    field: "",
    data: "",
    profileId: "",
})


// Retrieve Categories from Database
const retrieveAssetCategories = async () => {
  try {
    const response = await AssetCategoryServices.getAll()
    assetCategories.value = response.data.map((category) => ({
      title: category.categoryName,
      key: category.categoryId,
      description: category.desc,
      activeStatus: category.activeStatus,
    }))
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

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
    newData.value = response.data.map((data) => {
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

// Reset the profile form to its default state
const resetProfileForm = () => {
  newProfile.value = { profileName: "", desc: "", typeId: "" }
  selectedTypeId.value = ""
  validProfile.value = false
  editingProfile.value = false
}

// Save profile (add or edit)
const saveProfile = async () => {
  const profile = {
    profileName: newProfile.value.profileName,
    desc: newProfile.value.desc,
    typeId: selectedTypeId.value.key,
  }

  try {
    // Check if editing an existing profile (i.e., `id` is present)
    if (editingProfile.value && newProfile.value.id) {
      // Call update service if editing
      await AssetProfileServices.update(newProfile.value.id, profile)
      snackbarText.value = "Profile updated successfully."
    } else {
      snackbarText.value = "Profile added successfully."
      
      // Call create service if adding a new profile
      const createdProfile = await AssetProfileServices.create(profile)
      console.log("Created profile: ", createdProfile)


      if (createdProfile && createdProfile.data && createdProfile.data.profileId) {
        await saveProfileData(createdProfile.data.profileId)
      } else {
        throw new Error("Profile creation response missing profileId")
      }

    }
    message.value = "Profile saved successfully."
  } catch (error) {
    console.error("Error saving profile: ", error)
    message.value = `Error saving profile: ${error.message || "Unknown error"}`
  } finally {
    resetProfileForm()
    emitCloseDialog()
  }
}

// Save profileData
const saveProfileData = async (profileId) => {
  console.log("profileId: ", profileId)
  try {
    for(const field of generateDynamicFields.value) {
      const profileData = {
        field: field.newData.field,
        data: field.newData.data,
        profileId: profileId
      }
      await ProfileDataServices.create(profileData)
      console.log("profileData created: ", profileData)
    }
  } catch (error) {
    console.error("Error saving profile data: ", error)
    message.value = `Error saving profile data: ${error.message || "Unknown error"}`
  }
}

// Edit profile
const editProfile = () => {
    console.log("Passed in profile: ", selectedProfile.value)
    if (selectedProfile.value) {
        // Assign existing profile's properties, including its unique identifier
        newProfile.value = {
            ...selectedProfile.value,
            id: selectedProfile.value.profileId, 
        }
        selectedTypeId.value = selectedProfile.value.typeId
    }
}


// Edit profile
const editProfileData = () => {
    console.log("Passed in profile: ", selectedProfile.value)
    if (selectedProfile.value) {
        // Assign existing profile's properties, including its unique identifier
        newData.value = {
            ...selectedProfile.value,
            id: selectedProfile.value.profileId, 
        }
        selectedTypeId.value = selectedProfile.value.typeId
    }
}

// Function to populate text field with data from profileData
const populateTextField = (label) => {
    if (selectedProfile.value[label]) {
        textFieldValue.value = selectedProfile.value[label]
    } else {
        textFieldValue.value = '' // Clear the text field if no data found
    }
}

// Groups the text fields into row with 3 columns
const groupFields = computed(() => {
  const rowOfFields = []
  for(let i = 0; i < generateDynamicFields.value.length; i += 3) {
    rowOfFields.push(generateDynamicFields.value.slice(i, i + 3))
  }
  return rowOfFields
})

const emitCloseDialog = () => {
    emit('closeDialog')

}

onMounted(() => {
    // populateTextField('Manufacturer') // Adjust the label as needed
    retrieveProfileData()
    retrieveAssetTypes()
    retrieveAssetCategories()
    if (editingProfile.value) {
        editProfile()
    }
    console.log("editingProfile received in child: ", editingProfile.value)
    console.log("Profile received in child: ", selectedProfile.value)
})

// Watchers

// Ensures that the correct text fields appear when selectedType is changed 
watch(selectedTypeId, (newVal) => {
  let typeId

  if (typeof newVal === 'object' && newVal !== null && newVal.hasOwnProperty('typeId')) {
    typeId = newVal.typeId 
  } else {
    typeId = newVal
  }
  
  switch (typeId) {  
    
    // id 1 = smartphone
    case 1:
    generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'storage', label: 'Storage', type: 'text', newData: { field: 'storage', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ]
      break
    
    // id 2 = laptop
    case 2:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'CPU', label: 'CPU', type: 'text', newData: { field: 'CPU', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'memorySize', label: 'Memory Size', type: 'text', newData: { field: 'memorySize', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'batteryType', label: 'Battery Type', type: 'text', newData: { field: 'batteryType', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ]
      break

    // id 3 = tablet
    case 3:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'storage', label: 'Storage', type: 'text', newData: { field: 'storage', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ]
      break
      
    // id 4 = HVAC
    case 4:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'BTU', label: 'BTU', type: 'text', newData: { field: 'BTU', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'description', label: 'Description', type: 'textarea', newData: { field: 'description', data: '' }, rules: [rules.required, rules.maxNotesLength] }
      ]
      break

    // id 5 = projector
    case 5:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'bulbType', label: 'BulbType', type: 'text', newData: { field: 'bulbType', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ]
      break

    // id 6 = network switch 
    case 6:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'numberOfPorts', label: 'Number of Ports', type: 'text', newData: { field: 'numberOfPorts', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ];
      break;

    // id 7 = server
    case 7:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'storage', label: 'Storage', type: 'text', newData: { field: 'storage', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'OS', label: 'Operating System', type: 'text', newData: { field: 'OS', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ];
      break;

    // id 8 = desktop
    case 8:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'CPU', label: 'CPU', type: 'text', newData: { field: 'CPU', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'GPU', label: 'GPU', type: 'text', newData: { field: 'GPU', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'SSD', label: 'SSD', type: 'text', newData: { field: 'SSD', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'hardDriveSize', label: 'Hard Drive Size', type: 'text', newData: { field: 'hardDriveSize', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ];
      break;

    // id 9 = printer
    case 9:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'colorType', label: 'Color Type', type: 'text', newData: { field: 'colorType', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ];
      break;

    // id 10 = mic
    case 10:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'description', label: 'Description', type: 'textarea', newData: { field: 'description', data: '' }, rules: [rules.required, rules.maxNotesLength] }
      ];
      break;

    // id 11 = camera
    case 11:
      generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'lenses', label: 'Lenses', type: 'text', newData: { field: 'lenses', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'cameraType', label: 'Camera Type', type: 'text', newData: { field: 'cameraType', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ];
      break;

    // id 12 = video conferencing 
    case 12:
    generateDynamicFields.value = [
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', newData: { field: 'manufacturer', data: '' }, rules: [rules.required, rules.maxFieldLength] },
        { name: 'model', label: 'Model', type: 'text', newData: { field: 'model', data: '' }, rules: [rules.required, rules.maxFieldLength] }
      ]
      break

    default:
      console.log("Entered else")
      console.log("Selected type: ", typeId)
      generateDynamicFields.value = []
      break
    }
    console.log("Entered if")
    console.log("Selected type: ", typeId)
  
})

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
                    :rules="[rules.required, rules.maxFieldLength]"
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
                <v-col v-for="(rowFields, index) in groupFields" :key="index" cols="12">
                  <v-row>
                    <v-col v-for="(item, fieldIndex) in rowFields" :key="fieldIndex" cols="4">
                      <v-text-field
                        :label="item.label"
                        v-model="item.newData.data"
                        :rules="item.rules"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col>
                  <v-textarea
                  label="Notes"
                  v-model="newData.data"
                  :rules="[rules.maxNotesLength]"
                  ></v-textarea>
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