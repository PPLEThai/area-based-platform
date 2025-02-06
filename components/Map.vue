<template>
  <div class="relative w-full h-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
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
    validator: (value) => {
      return value.length === 2 && !isNaN(value[0]) && !isNaN(value[1]);
    },
  },
  zoom: {
    type: Number,
    required: true,
    default: 10,
  },
});

const emit = defineEmits(["mapLoaded"]);
const map = ref(null);
const mapContainer = ref(null);

// Layer visibility state
const layers = ref({
  districtBoundary: true,
  bkkBoundary: true,
});

const initializeMap = async () => {
  await nextTick();

  // Validate center coordinates before initializing map
  if (!props.center || props.center.some((coord) => isNaN(coord))) {
    console.error("Invalid center coordinates:", props.center);
    return;
  }

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: props.mapStyle,
    center: props.center,
    zoom: props.zoom,
  });

  map.value.on("load", () => {
    emit("mapLoaded", map.value);
  });
};

onMounted(() => {
  initializeMap();
});
</script>

<style scoped>
/* Add any additional styles here */
.layer-selection {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
