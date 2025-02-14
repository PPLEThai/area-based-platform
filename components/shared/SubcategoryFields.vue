<template>
  <div v-if="fields" class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="(field, key) in fields"
      :key="key"
      :class="{ 'md:col-span-2': field.fullWidth || field.type === 'longtext' }"
    >
      <label :for="key" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
      </label>
      <!-- Input สำหรับ text และ number -->
      <input
        v-if="field.type !== 'longtext'"
        :id="key"
        :type="field.type"
        v-model="localValue[key]"
        :min="field.min"
        :placeholder="field.placeholder"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        @input="updateValue"
      />
      <!-- Textarea สำหรับ longtext -->
      <textarea
        v-else
        :id="key"
        v-model="localValue[key]"
        rows="4"
        :placeholder="field.placeholder"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      ></textarea>
      <p v-if="showValidation && errors[key]" class="text-red-500 text-sm">
        {{ errors[key] }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useSubcategoryFields } from "@/composables/useSubcategoryFields";

const props = defineProps({
  subcategoryId: {
    type: [Number, String],
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
  showValidation: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { subcategoryFields, validateFields, getDefaultValues } = useSubcategoryFields();
const fields = ref(subcategoryFields[props.subcategoryId]);
const errors = ref({});

// เปลี่ยนจาก ref เป็น computed เพื่อให้ reactive กับ props.modelValue
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// อัพเดท fields เมื่อเปลี่ยน subcategory
watch(
  () => props.subcategoryId,
  (newId) => {
    fields.value = subcategoryFields[newId];
  }
);

// ตรวจสอบ validation
watch(
  () => props.modelValue,
  (newValue) => {
    const { errors: validationErrors } = validateFields(props.subcategoryId, newValue);
    errors.value = validationErrors;
  },
  { deep: true }
);

// ไม่จำเป็นต้องมี updateValue แล้วเพราะใช้ computed
</script>
