<script setup>
import { ref, toRefs, watch } from "vue";

// Define props
const props = defineProps({
    selectedTypeId: { 
        required: true
    }
});

// Destructure the selectedTypeId prop
const { selectedTypeId } = toRefs(props);

const typeID = ref(selectedTypeId.value);

watch(selectedTypeId, (newValue, oldValue) => {
    console.log("passed prop ID:", selectedTypeId.value)
    typeID.value = newValue;
});

</script>

<template>
    <div v-if="selectedTypeId=='2'">
      <!-- Display different text fields based on selected type -->
        <v-row>
            <v-col cols="12">
                <v-text-field
                    label="Manufacturer"
                    v-model="newSerializedAsset.serializedNumber"
                    :rules="[rules.required, rules.serialNumberLength]"
                    maxlength="20"
                    counter
                ></v-text-field>
            </v-col>
    </div>
</template>
