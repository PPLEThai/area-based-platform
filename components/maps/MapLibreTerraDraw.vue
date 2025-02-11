<template>
  <div class="relative w-full h-full">
    <SearchBox @select-result="selectResult" />

    <!-- Basemap Selection -->
    <div class="absolute bottom-10 right-4 z-10 bg-white p-1.5 rounded shadow-lg">
      <select
        v-model="selectedBasemap"
        class="p-1.5 rounded border text-sm"
        @change="changeBasemap"
      >
        <option value="light">แผนที่พื้นฐาน</option>
        <option value="dark">แผนที่มืด</option>
        <option value="satellite">แผนที่ดาวเทียม</option>
      </select>
    </div>

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
import SearchBox from "@/components/maps/SearchBox.vue";

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

// Basemap styles
const basemapStyles = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite: "https://api.maptiler.com/maps/hybrid/style.json?key=DMl4AxokgMPvgzLikrFx",
};

const selectedBasemap = ref("light");

const changeBasemap = () => {
  if (map.value) {
    const currentCenter = map.value.getCenter();
    const currentZoom = map.value.getZoom();

    map.value.setStyle(basemapStyles[selectedBasemap.value]);

    setTimeout(() => {
      drawProvinceBoundary();
    }, 1000);
  }
};

// Emits
const emit = defineEmits(["features-updated", "mapLoaded"]);

// Reactive variables
const mapContainer = ref(null); // Reference to the map container
const map = ref(null);
const draw = ref(null);
const features = ref([]);

// search display
const currentMarker = ref(null);

// Initialize Map
const initializeMap = async () => {
  await nextTick(); // รอให้ DOM ของ mapContainer เรนเดอร์เสร็จ

  if (!mapContainer.value) return; // Ensure the map container is available

  map.value = new maplibregl.Map({
    container: mapContainer.value, // ใช้ DOM element ที่ mapContainer ชี้ไป
    style: basemapStyles[selectedBasemap.value],
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
      // const thProvinceId = feature.properties.id.replace("TH", ""); // for th_minified.json
      const thProvinceId = feature.properties.id; // for th_simply.json ละเอียดกว่า
      return thProvinceId === Number(props.provinceId);
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

const selectResult = (result) => {
  map.value.flyTo({
    center: [result.lon, result.lat],
    zoom: 14,
  });

  if (currentMarker.value) {
    currentMarker.value.remove();
  }

  currentMarker.value = new maplibregl.Marker()
    .setLngLat([result.lon, result.lat])
    .setPopup(
      new maplibregl.Popup().setHTML(`<h3>${result.name}</h3><p>${result.address}</p>`)
    )
    .addTo(map.value);
};

// Lifecycle Hook
onMounted(() => {
  initializeMap();
});
</script>

<style scoped></style>
