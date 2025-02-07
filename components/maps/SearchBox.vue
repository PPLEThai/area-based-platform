<template>
  <div class="absolute top-4 left-4 z-10 w-64 sm:w-96">
    <input
      type="text"
      v-model="searchQuery"
      @keydown.enter="performSearch"
      :placeholder="placeholder"
      class="w-full p-2 border rounded-lg shadow"
    />
    <ul v-if="searchResults.length" class="bg-white border rounded-lg shadow mt-2">
      <li
        v-for="result in searchResults"
        :key="result.id"
        @click="handleSelect(result)"
        class="p-2 hover:bg-gray-200 cursor-pointer"
      >
        {{ result.name }}
      </li>
    </ul>
    <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  placeholder: {
    type: String,
    default: "ค้นหาสถานที่ เช่น เพชรเกษม 48",
  },
});

const emit = defineEmits(["select-result"]);

const config = useRuntimeConfig();
const mapKey = config.public.apiMapKey;

const searchQuery = ref("");
const searchResults = ref([]);
const errorMessage = ref("");

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  const url = `https://search.longdo.com/mapsearch/json/search?keyword=${encodeURIComponent(
    searchQuery.value
  )}&limit=5&key=${mapKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      searchResults.value = data.data;
      errorMessage.value = "";
    } else {
      searchResults.value = [];
      errorMessage.value = `ไม่พบสถานที่ที่ตรงกับ "${searchQuery.value}"`;
    }
  } catch (error) {
    console.error("Search error:", error);
    errorMessage.value = "เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่";
  }
};

const handleSelect = (result) => {
  emit("select-result", result);
  searchResults.value = [];
  searchQuery.value = "";
};
</script>
