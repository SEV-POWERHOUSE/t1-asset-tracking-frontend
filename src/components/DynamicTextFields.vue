<script setup>
import { ref, toRefs, watch } from "vue"

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

// Call populateTextField when component is mounted or selectedTypeId changes
onMounted(() => {
    populateTextField('Manufacturer') // Adjust the label as needed
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