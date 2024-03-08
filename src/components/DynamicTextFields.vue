<script setup>
import { ref, toRefs, watch } from "vue"
import ProfileDataServices from "../services/assetProfileServices";

// Validation Rules
const rules = {
  required: (value) => !!value || "Required.",
  maxDescLength: (value) => value.length <= 255,
  maxNameLength: (value) => value.length <= 50,
  serialNumberLength: (value) => value.length <= 20,
}
// Define props
const props = defineProps({
    selectedTypeId: { 
        required: true
    },
    formData: {
        required: true
    }
})
const newData = ref({
  field: "",
  data: "",
  profileId: "",
});

// Destructure the selectedTypeId and formData props
const { selectedTypeId, formData } = toRefs(props)

const typeID = ref(selectedTypeId.value)

watch(selectedTypeId, (newValue, oldValue) => {
    console.log("passed prop ID:", selectedTypeId.value)
    typeID.value = newValue;
})

const textFieldValue = ref('')

const submitForm = () => {
    const dataToEmit = {
        name: "Manufacturer",
        data: textFieldValue.value
    }
    
    // Emit an event to pass data back to parent
    emit('formData', dataToEmit)
}

// Function to populate text field with data from formData
const populateTextField = (label) => {
    if (formData.value[label]) {
        textFieldValue.value = formData.value[label]
    } else {
        textFieldValue.value = '' // Clear the text field if no data found
    }
};

// Retrieve Profiles from Database
const retrieveProfileData = async () => {
  try {
    const response = await ProfileDataServices.getAll();

    profileData.value = response.data.map((data) => {
      return {
        ...data,
        key: data.profileDataId,
        title: data.field,
      };
    });
  } catch (error) {
    console.error("Error loading profile data:", error);
    message.value = "Failed to load profile data.";
  }
};

// Call populateTextField when component is mounted or selectedTypeId changes
onMounted(() => {
    populateTextField('Manufacturer') // Adjust the label as needed
    retrieveProfileData()
});

watch(selectedTypeId, (newValue, oldValue) => {
    console.log("passed prop ID:", selectedTypeId.value)
    typeID.value = newValue
    populateTextField('Manufacturer')
});

</script>

<template>
    <div v-if="selectedTypeId=='2'">
      <!-- Display different text fields based on selected type -->
        <v-text-field
            label="Manufacturer"
            v-model="textFieldValue.value"
            :rules="[rules.maxNameLength, rules.re]"
            maxlength="20"
            counter
        ></v-text-field>
    </div>
</template>


<!-- Love, Zane -->