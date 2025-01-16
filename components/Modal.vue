<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-3/3 md:w-1/3">
      <h2 class="text-lg font-medium text-gray-800 mb-4">{{ title }}</h2>
      <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="cancel"
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ยกเลิก
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          ยืนยัน
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "ยืนยันการกระทำ",
    },
    message: {
      type: String,
      default: "คุณแน่ใจหรือไม่?",
    },
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
};
</script>
