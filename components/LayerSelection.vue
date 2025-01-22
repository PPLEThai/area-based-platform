<template>
  <div class="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-bold">ชั้นข้อมูล</h3>
      <button @click="isExpanded = !isExpanded" class="text-gray-500 hover:text-gray-700">
        <span v-if="isExpanded">▼</span>
        <span v-else>▶</span>
      </button>
    </div>
    <div v-if="isExpanded" class="space-y-2">
      <div>
        <div class="flex items-center">
          <input type="checkbox" id="community" v-model="layers.community" class="mr-2" />
          <label for="community">พิกัดชุมชน</label>
        </div>
        <div class="ml-6 mt-2 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span>ชุมชนแออัด</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span>ชุมชนชานเมือง</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>ชุมชนหมู่บ้านจัดสรร</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-yellow-300"></div>
            <span>เคหะชุมชน</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-fuchsia-500"></div>
            <span>ชุมชนเมือง</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span>ชุมชนอาคารสูง</span>
          </div>
        </div>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="district-boundary"
          v-model="layers.districtBoundary"
          class="mr-2"
        />
        <label for="district-boundary">ขอบเขตเขต</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="bkk-boundary"
          v-model="layers.bkkBoundary"
          class="mr-2"
        />
        <label for="bkk-boundary">ขอบเขตกรุงเทพฯ</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import communityData from "@/assets/data/community.json";

const isExpanded = ref(true);

const layers = ref({
  community: false,
  districtBoundary: true,
  bkkBoundary: true,
});

const emit = defineEmits(["update:layers"]);

watch(
  () => layers.value,
  (newLayers) => {
    emit("update:layers", {
      community: {
        visible: newLayers.community,
        data: communityData,
      },
      districtBoundary: newLayers.districtBoundary,
      bkkBoundary: newLayers.bkkBoundary,
    });
  },
  { deep: true }
);
</script>
