<template>
  <div class="flex h-full md:flex-row md:h-full items-center justify-center bg-gray-100">
    <div class="flex flex-col gap-4 w-80">
      <h1 class="text-2xl font-bold text-center text-gray-800">เลือกจังหวัด</h1>

      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="ค้นหาจังหวัด..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @focus="showDropdown = true"
        />

        <div
          v-if="showDropdown && filteredProvinces.length > 0"
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <NuxtLink
            v-for="province in filteredProvinces"
            :key="province.id"
            :to="province.path"
            class="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="showDropdown = false"
          >
            {{ province.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProvinces } from "@/composables/useProvinces";

const { provinces } = useProvinces();

const searchQuery = ref("");
const showDropdown = ref(false);

const filteredProvinces = computed(() => {
  if (!searchQuery.value) return provinces;
  const query = searchQuery.value.toLowerCase();
  return provinces.filter((province) => province.name.toLowerCase().includes(query));
});

// ปิด dropdown เมื่อคลิกนอก component
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".relative")) {
      showDropdown.value = false;
    }
  });
});
</script>
