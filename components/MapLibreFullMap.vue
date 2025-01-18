<template>
  <div class="relative w-full h-full">
    <!-- Search Box -->
    <div class="absolute top-4 left-4 z-10 w-72">
      <input
        type="text"
        v-model="searchQuery"
        @keydown.enter="performSearch"
        placeholder="Search for a place..."
        class="w-full p-2 border rounded-lg shadow"
      />
      <ul v-if="searchResults.length" class="bg-white border rounded-lg shadow mt-2">
        <li
          v-for="result in searchResults"
          :key="result.id"
          @click="selectResult(result)"
          class="p-2 hover:bg-gray-200 cursor-pointer"
        >
          {{ result.name }}
        </li>
      </ul>
      <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const props = defineProps({
  mapStyle: {
    type: String,
    required: true,
  },
  center: {
    type: Array,
    required: true,
    default: () => [100.523186, 13.736717],
  },
  zoom: {
    type: Number,
    required: true,
    default: 10,
  },
});

// Import the custom composable
import { useBkkBoundary, useBkkDistrictBoundary } from "@/composables/useBoundary";

const { getBkkBoundaryData } = useBkkBoundary(); // Extract the function
const { getBkkDistrictBoundaryData } = useBkkDistrictBoundary(); // Extract the function
const bkkBoundaryData = getBkkBoundaryData(); // Load the boundary data
const bkkDistrictBoundary = getBkkDistrictBoundaryData(); // Load the boundary data

const emit = defineEmits(["mapLoaded"]);
const map = ref(null);
const mapContainer = ref(null);
const searchQuery = ref("");
const searchResults = ref([]);
const errorMessage = ref("");

// search display
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  const url = `https://search.longdo.com/mapsearch/json/search?keyword=${encodeURIComponent(
    searchQuery.value
  )}&limit=5&key=fortestonlydonotuseinproduction!`;

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

const selectResult = (result) => {
  map.value.flyTo({
    center: [result.lon, result.lat],
    zoom: 14,
  });

  new maplibregl.Marker()
    .setLngLat([result.lon, result.lat])
    .setPopup(
      new maplibregl.Popup().setHTML(`<h3>${result.name}</h3><p>${result.address}</p>`)
    )
    .addTo(map.value);

  searchResults.value = [];
  searchQuery.value = "";
};

const initializeMap = async () => {
  await nextTick(); // รอให้ DOM ของ mapContainer เรนเดอร์เสร็จ

  map.value = new maplibregl.Map({
    container: mapContainer.value, // ใช้ DOM element ที่ mapContainer ชี้ไป
    style: props.mapStyle,
    center: props.center,
    zoom: props.zoom,
  });

  map.value.on("load", () => {
    // Add boundary data to the map
    emit("mapLoaded", map.value); // ส่งอีเวนต์กลับไปยังผู้เรียก

    map.value.addSource("district-boundary", {
      type: "geojson",
      data: bkkDistrictBoundary,
    });

    map.value.addSource("bkk-boundary", {
      type: "geojson",
      data: bkkBoundaryData,
    });

    map.value.addLayer({
      id: "bkk-boundary-layer",
      type: "line",
      source: "bkk-boundary",
      paint: {
        "line-color": "#ff6a13",
        "line-width": 2,
      },
    });

    map.value.addLayer({
      id: "district-boundary-layer",
      type: "line",
      source: "district-boundary",
      paint: {
        "line-color": "#052b49",
        "line-width": 1,
        "line-opacity": 0.4,
      },
    });
  });
};

onMounted(() => {
  initializeMap();
});
</script>
