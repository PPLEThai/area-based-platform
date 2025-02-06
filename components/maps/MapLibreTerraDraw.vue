<template>
  <div class="relative w-full h-full">
    <!-- Search Box -->
    <div class="absolute top-4 left-4 z-10 w-64 sm:w-96">
      <input
        type="text"
        v-model="searchQuery"
        @keydown.enter="performSearch"
        placeholder="ค้นหาสถานที่ เช่น เพชรเกษม 48"
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
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import { useThailandBoundary } from "@/composables/useBoundary";

// Props
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
  province: {
    type: String,
    required: true,
  },
  provinceId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(["features-updated", "mapLoaded"]);

// Reactive variables
const mapContainer = ref(null); // Reference to the map container
const map = ref(null);
const draw = ref(null);
const features = ref([]);

// search display
const searchQuery = ref("");
const searchResults = ref([]);
const errorMessage = ref("");
const currentMarker = ref(null);

// Initialize Map
const initializeMap = async () => {
  await nextTick(); // รอให้ DOM ของ mapContainer เรนเดอร์เสร็จ

  if (!mapContainer.value) return; // Ensure the map container is available

  map.value = new maplibregl.Map({
    container: mapContainer.value, // ใช้ DOM element ที่ mapContainer ชี้ไป
    style: props.mapStyle,
    center: props.center,
    zoom: props.zoom,
  });

  draw.value = new MaplibreTerradrawControl({
    modes: [
      "render",
      "point",
      "linestring",
      "polygon",
      // "rectangle",
      // "circle",
      // "freehand",
      // "angled-rectangle",
      // "sensor",
      // "sector",
      "select",
      "delete-selection",
      "delete",
    ],
    open: true,
  });

  map.value.addControl(draw.value, "top-right");
  map.value.on("load", function () {
    drawProvinceBoundary();
    emit("mapLoaded", map.value); // ส่งอีเวนต์กลับไปยังผู้เรียก
  });

  const drawInstance = draw.value.getTerraDrawInstance();
  if (drawInstance) {
    drawInstance.on("change", () => {
      const snapshot = drawInstance.getSnapshot();
      features.value = snapshot;
      emit("features-updated", features.value); // Emit the updated features
    });
  }
};

const drawProvinceBoundary = () => {
  const { getThailandBoundaryData } = useThailandBoundary();
  const thBoundary = getThailandBoundaryData();

  const provinceFeature = {
    type: "FeatureCollection",
    features: thBoundary.features.filter((feature) => {
      const thProvinceId = feature.properties.id.replace("TH", "");
      return thProvinceId === props.provinceId;
    }),
  };

  map.value.addSource("province-boundary", {
    type: "geojson",
    data: provinceFeature,
  });

  map.value.addLayer({
    id: "province-boundary-layer",
    type: "line",
    source: "province-boundary",
    paint: {
      "line-color": "#ff6a13",
      "line-width": 2,
    },
  });
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  // Remove existing marker if it exists
  if (currentMarker.value) {
    currentMarker.value.remove();
    currentMarker.value = null;
  }

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

  // Remove existing marker if it exists
  if (currentMarker.value) {
    currentMarker.value.remove();
  }

  // Create and store new marker
  currentMarker.value = new maplibregl.Marker()
    .setLngLat([result.lon, result.lat])
    .setPopup(
      new maplibregl.Popup().setHTML(`<h3>${result.name}</h3><p>${result.address}</p>`)
    )
    .addTo(map.value);

  searchResults.value = [];
  searchQuery.value = "";
};

// Lifecycle Hook
onMounted(() => {
  initializeMap();
});
</script>

<style scoped></style>
