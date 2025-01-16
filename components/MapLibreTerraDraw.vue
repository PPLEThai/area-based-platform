<template>
  <div class="relative w-full h-full">
    <!-- Search Box -->
    <!-- <div class="absolute top-4 left-4 z-10 w-96">
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
    </div> -->

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
});

// Import the custom composable
import { useBkkBoundary } from "@/composables/useBoundary";
const { getBkkBoundaryData } = useBkkBoundary(); // Extract the function
const bkkBoundaryData = getBkkBoundaryData(); // Load the boundary data

// Emits
const emit = defineEmits(["features-updated"]);

// Reactive variables
const mapContainer = ref(null); // Reference to the map container
const map = ref(null);
const draw = ref(null);
const features = ref([]);

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
      "rectangle",
      "circle",
      "freehand",
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
  map.value.on('load', function () {
    drawBkkBoundary()
  })

  const drawInstance = draw.value.getTerraDrawInstance();
  if (drawInstance) {
    drawInstance.on("change", () => {
      const snapshot = drawInstance.getSnapshot();
      features.value = snapshot;
      emit("features-updated", features.value); // Emit the updated features
    });
  }
};

const drawBkkBoundary = () => {
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
}

// Lifecycle Hook
onMounted(() => {
  initializeMap();
});
</script>

<style scoped></style>
