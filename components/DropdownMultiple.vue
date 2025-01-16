<template>
  <div class="relative inline-block w-full">
    <!-- Button to toggle dropdown -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full flex justify-between items-center bg-gray-50 border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <span>{{
        selected.length > 0 ? selected.map((item) => item.name).join(", ") : placeholder
      }}</span>
      <svg
        class="w-5 h-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06 0L10 10.92l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-show="isOpen"
      class="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg"
      @click.self="closeDropdown"
    >
      <div class="px-4 py-2 max-h-60 overflow-y-auto">
        <template v-for="option in options" :key="option.id">
          <label class="inline-flex items-center w-full mb-2">
            <input
              type="checkbox"
              :value="option"
              class="form-checkbox rounded text-blue-600 focus:ring-blue-500"
              @change="toggleSelection(option)"
              :checked="selected.includes(option)"
            />
            <span class="ml-2 text-sm text-gray-700">{{ option.name }}</span>
          </label>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Select options",
    },
  },
  data() {
    return {
      isOpen: false,
      selected: [],
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    closeDropdown() {
      this.isOpen = false;
    },
    toggleSelection(option) {
      const index = this.selected.findIndex((item) => item.id === option.id);
      if (index !== -1) {
        this.selected.splice(index, 1); // Remove option
      } else {
        this.selected.push(option); // Add option
      }
      this.$emit("update:selected", this.selected);
    },
  },
};
</script>

<style scoped>
/* Optional: Add styles for better UX */
</style>
