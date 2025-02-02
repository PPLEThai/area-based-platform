<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full sm:max-w-[1000px] md:h-auto">
      <!-- Modal Header -->
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <button @click="$emit('cancel')" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4">
        <slot />
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end px-4 py-3 border-t border-gray-300">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
        >
          ยกเลิก
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="name === '' || detail === '' || subCategory === ''"
          class="px-4 py-2 rounded hover:bg-primary-dark"
          :class="[
            name === '' || detail === '' || subCategory === '' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white'
          ]"
        >
          ยืนยัน
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  detail: {
    type: String,
    default: "",
  },
  subCategory: {
    type: Number,
    default: null,
  }
});

</script>
