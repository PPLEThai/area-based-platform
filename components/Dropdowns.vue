<template>
  <div class="space-y-4">
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700"
        >หมวดหมู่</label
      >
      <select
        id="category"
        v-model="selectedCategoryId"
        @change="updateSubcategories"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="" disabled selected>เลือกหมวดหมู่</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <div>
      <label for="subcategory" class="block text-sm font-medium text-gray-700"
        >หมวดหมู่ย่อย</label
      >
      <select
        id="subcategory"
        v-model="selectedSubcategoryId"
        :disabled="!subcategoryList.length"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="" disabled selected>เลือกหมวดหมู่ย่อย</option>
        <option
          v-for="subcategory in subcategoryList"
          :key="subcategory.id"
          :value="subcategory.id"
        >
          {{ subcategory.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { useCategories } from "@/composables/useCategories";

export default {
  props: {
    resetTrigger: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  watch: {
    resetTrigger(newValue) {
      if (newValue) {
        this.resetDropdown();
      }
    },
    selectedSubcategoryId() {
      this.emitSelection();
    },
  },
  data() {
    return {
      categories: [],
      subcategoryList: [],
      selectedCategoryId: "",
      selectedSubcategoryId: "",
    };
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    resetDropdown() {
      this.selectedCategoryId = "";
      this.selectedSubcategoryId = "";
      this.subcategoryList = [];
    },
    async loadCategories() {
      try {
        const categories = await import("@/assets/data/categories.json");
        // const categories = await import("http://localhost:3003/categories/list");

        this.categories = categories.default;
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    },
    updateSubcategories() {
      const selectedCategory = this.categories.find(
        (category) => category.id === parseInt(this.selectedCategoryId)
      );
      this.subcategoryList = selectedCategory ? selectedCategory.subcategories : [];
      this.selectedSubcategoryId = ""; // Reset Subcategory เมื่อเปลี่ยน Category
      this.emitSelection();
    },
    emitSelection() {
      this.$emit("selection-changed", {
        selectedCategoryId: this.selectedCategoryId,
        selectedSubcategoryId: this.selectedSubcategoryId,
      });
    },
  },
};
</script>

<style scoped>
select option {
  color: #4a5568;
  /* เพิ่มสีให้ option */
}
</style>
