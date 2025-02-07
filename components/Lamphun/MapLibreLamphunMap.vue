<template>
  <div class="relative w-full h-full">
    <SearchBox @select-result="selectResult" placeholder="ค้นหาสถานที่ในลำพูน..." />

    <!-- Layer Selection & Legend -->
    <div class="absolute top-4 right-4 z-10 bg-white p-4 rounded shadow-lg">
      <h3 class="font-bold mb-4">Filter Layers</h3>
      <div v-for="(visible, layer) in layers" :key="layer" class="flex items-center mb-2">
        <input type="checkbox" v-model="layers[layer]" :id="layer" class="mr-2" />
        <label :for="layer" class="flex items-center">
          <span
            v-if="layer === 'villagePoints'"
            class="inline-block w-4 h-4 mr-2 rounded-full bg-red-500"
          ></span>
          <span
            v-if="layer === 'hospitalPoints'"
            class="inline-block w-4 h-4 mr-2 rounded-full bg-green-500"
          ></span>
          <span
            v-if="layer === 'bigHospitalPoints'"
            class="inline-block w-4 h-4 mr-2 rounded-full bg-blue-500"
          ></span>
          <img
            v-if="layer === 'schoolPoints'"
            src="/images/icons/school.png"
            class="w-4 h-4 mr-2"
          />
          <span
            v-if="layer === 'floodArea'"
            class="inline-block w-4 h-4 mr-2 bg-[#7db0fb] opacity-50"
          ></span>
          <span
            v-if="layer === 'smBoundary'"
            class="inline-block w-4 h-4 mr-2 bg-[#FFFF00]"
          ></span>
          <span
            v-if="layer === 'saoBoundary'"
            class="inline-block w-4 h-4 mr-2 bg-purple-500"
          ></span>
          {{ layerLabels[layer] }}
        </label>
      </div>
    </div>

    <!-- Basemap Selection -->
    <div class="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-lg">
      <select
        v-model="selectedBasemap"
        class="p-2 rounded border"
        @change="changeBasemap"
      >
        <option value="light">แผนที่สว่าง</option>
        <option value="dark">แผนที่มืด</option>
        <option value="satellite">แผนที่ดาวเทียม</option>
      </select>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import villageData from "@/assets/data/lamphun_village.json";
import floodData from "@/assets/data/lamphun_flood.json";
import hospitalData from "@/assets/data/lamphun_hospital.json";
import bigHospitalData from "@/assets/data/lamphun_hospital_big.json";
import schoolData from "@/assets/data/lamphun_school.json";
import subdistrictData from "@/assets/data/lamphun_subdistrict.json";
import smData from "@/assets/data/lamphun_sm.json";
import saoData from "@/assets/data/lamphun_sao.json";
import {
  useLamphunBoundary,
  useLamphunDistrictBoundary,
} from "@/composables/useBoundary";
import SearchBox from "@/components/maps/SearchBox.vue";

const props = defineProps({
  mapStyle: {
    type: String,
    required: true,
    default: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  center: {
    type: Array,
    required: true,
    default: () => [98.952368, 17.991376],
  },
  zoom: {
    type: Number,
    required: true,
    default: 10,
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
    // เก็บค่า layers ที่เปิดอยู่ก่อนเปลี่ยน basemap
    const currentLayers = { ...layers.value };
    const currentCenter = map.value.getCenter();
    const currentZoom = map.value.getZoom();

    // เปลี่ยน style ของ basemap
    map.value.setStyle(basemapStyles[selectedBasemap.value]);

    // รอให้ style โหลดเสร็จแล้วค่อยเพิ่ม layers กลับมา
    map.value.once("style.load", () => {
      // คืนค่า center และ zoom เดิม
      map.value.setCenter(currentCenter);
      map.value.setZoom(currentZoom);

      // เพิ่ม layers กลับมาทั้งหมด
      initializeLayers();

      // คืนค่าการแสดงผลของแต่ละ layer
      Object.keys(currentLayers).forEach((layer) => {
        layers.value[layer] = currentLayers[layer];
      });
    });
  }
};

const { getLamphunBoundaryData } = useLamphunBoundary();
const { getLamphunDistrictBoundaryData } = useLamphunDistrictBoundary();
const lamphunBoundaryData = getLamphunBoundaryData();
const lamphunDistrictBoundary = getLamphunDistrictBoundaryData();

const emit = defineEmits(["mapLoaded"]);
const map = ref(null);
const mapContainer = ref(null);
const schoolImage = ref("/images/icons/school.png");

// Layer visibility state
const layers = ref({
  subdistrictBoundary: false,
  districtBoundary: true,
  floodArea: true,
  villagePoints: true,
  hospitalPoints: true,
  bigHospitalPoints: true,
  schoolPoints: true,
  smBoundary: true,
  saoBoundary: true,
});

const layerLabels = {
  subdistrictBoundary: "ขอบเขตตำบล",
  districtBoundary: "ขอบเขตอำเภอ",
  floodArea: "พื้นที่เสี่ยงน้ำท่วม",
  villagePoints: "หมู่บ้าน",
  hospitalPoints: "รพ.สต.",
  bigHospitalPoints: "โรงพยาบาลศูนย์",
  schoolPoints: "โรงเรียน",
  smBoundary: "เทศบาลตำบล",
  saoBoundary: "อบต.",
};

// Watch for layer visibility changes
watch(
  () => layers.value,
  (newLayers) => {
    if (!map.value) return;

    // Toggle district boundary layer
    map.value.setLayoutProperty(
      "district-boundary-layer",
      "visibility",
      newLayers.districtBoundary ? "visible" : "none"
    );

    // Toggle flood area layer
    map.value.setLayoutProperty(
      "flood-layer",
      "visibility",
      newLayers.floodArea ? "visible" : "none"
    );

    // Toggle village points layer
    map.value.setLayoutProperty(
      "village-layer",
      "visibility",
      newLayers.villagePoints ? "visible" : "none"
    );

    // Toggle hospital points layer
    map.value.setLayoutProperty(
      "hospital-layer",
      "visibility",
      newLayers.hospitalPoints ? "visible" : "none"
    );

    // Toggle big hospital points layer and radius
    map.value.setLayoutProperty(
      "big-hospital-layer",
      "visibility",
      newLayers.bigHospitalPoints ? "visible" : "none"
    );
    map.value.setLayoutProperty(
      "big-hospital-radius",
      "visibility",
      newLayers.bigHospitalPoints ? "visible" : "none"
    );

    // Toggle school points layer
    map.value.setLayoutProperty(
      "school-layer",
      "visibility",
      newLayers.schoolPoints ? "visible" : "none"
    );

    // Toggle subdistrict boundary layer
    map.value.setLayoutProperty(
      "subdistrict-layer",
      "visibility",
      newLayers.subdistrictBoundary ? "visible" : "none"
    );

    // Toggle SM boundary layer
    map.value.setLayoutProperty(
      "sm-layer",
      "visibility",
      newLayers.smBoundary ? "visible" : "none"
    );

    // Toggle SAO boundary layer
    map.value.setLayoutProperty(
      "sao-layer",
      "visibility",
      newLayers.saoBoundary ? "visible" : "none"
    );
  },
  { deep: true }
);

const initializeMap = async () => {
  await nextTick();

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: basemapStyles[selectedBasemap.value],
    center: props.center,
    zoom: props.zoom,
  });

  map.value.on("styleimagemissing", (e) => {
    if (e.id === "school-icon" && !map.value.hasImage("school-icon")) {
      const img = new Image();
      img.src = schoolImage.value;
      img.onload = () => {
        if (!map.value.hasImage("school-icon")) {
          map.value.addImage("school-icon", img);
        }
      };
    }
  });

  map.value.on("load", () => {
    emit("mapLoaded", map.value);
    initializeLayers();
  });
};

const initializeLayers = () => {
  // Add boundary sources
  // console.log(lamphunDistrictBoundary);
  map.value.addSource("district-boundary", {
    type: "geojson",
    data: lamphunDistrictBoundary,
  });

  map.value.addSource("lamphun-boundary", {
    type: "geojson",
    data: lamphunBoundaryData,
  });

  // Add flood data source
  map.value.addSource("flood-area", {
    type: "geojson",
    data: floodData,
  });

  // Add flood layer
  map.value.addLayer({
    id: "flood-layer",
    type: "fill",
    source: "flood-area",
    paint: {
      "fill-color": "#0066ff",
      "fill-opacity": 0.5,
      "fill-outline-color": "#0044aa",
    },
    layout: {
      visibility: layers.value.floodArea ? "visible" : "none",
    },
  });

  // Add boundary layers
  map.value.addLayer({
    id: "lamphun-boundary-layer",
    type: "line",
    source: "lamphun-boundary",
    paint: {
      "line-color": "#ff6a13",
      "line-width": 2,
      "line-opacity": layers.value.districtBoundary ? 1 : 0,
    },
  });

  map.value.addLayer({
    id: "district-boundary-layer",
    type: "line",
    source: "district-boundary",
    paint: {
      "line-color": "#052b49",
      "line-width": 1,
      "line-opacity": layers.value.districtBoundary ? 0.4 : 0,
    },
  });

  // เพิ่ม GeoJSON source สำหรับหมู่บ้าน
  map.value.addSource("village-points", {
    type: "geojson",
    data: villageData,
  });

  // เพิ่ม layer แสดงจุดหมู่บ้าน
  map.value.addLayer({
    id: "village-layer",
    type: "circle",
    source: "village-points",
    paint: {
      "circle-radius": 3,
      "circle-color": "#FF0000", // สีแดงสำหรับหมู่บ้าน
      "circle-opacity": 0.8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
    },
  });

  // เพิ่ม popup เมื่อคลิกที่จุดหมู่บ้าน
  map.value.on("click", "village-layer", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const villageName = e.features[0].properties.v_name_t;

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<h3>${villageName}</h3>`)
      .addTo(map.value);
  });

  // เปลี่ยน cursor เมื่อ hover บนจุดหมู่บ้าน
  map.value.on("mouseenter", "village-layer", () => {
    map.value.getCanvas().style.cursor = "pointer";
  });

  map.value.on("mouseleave", "village-layer", () => {
    map.value.getCanvas().style.cursor = "";
  });

  // Add school points layer
  map.value.addSource("school-points", {
    type: "geojson",
    data: schoolData,
  });

  map.value.addLayer({
    id: "school-layer",
    type: "symbol",
    source: "school-points",
    layout: {
      "icon-image": "school-icon",
      "icon-size": 0.12,
      "icon-allow-overlap": true,
    },
  });

  // Add popup for school points
  map.value.on("click", "school-layer", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const schoolName = e.features[0].properties.CUL_PNAME;

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<h3>${schoolName}</h3>`)
      .addTo(map.value);
  });

  // Change cursor on hover for school points
  map.value.on("mouseenter", "school-layer", () => {
    map.value.getCanvas().style.cursor = "pointer";
  });

  map.value.on("mouseleave", "school-layer", () => {
    map.value.getCanvas().style.cursor = "";
  });

  // เพิ่ม GeoJSON source สำหรับโรงพยาบาล
  map.value.addSource("hospital-points", {
    type: "geojson",
    data: hospitalData,
  });

  // เพิ่ม layer แสดงจุดโรงพยาบาล
  map.value.addLayer({
    id: "hospital-layer",
    type: "circle",
    source: "hospital-points",
    paint: {
      "circle-radius": 5,
      "circle-color": "#00FF00", // สีเขียวสำหรับโรงพยาบาล
      "circle-opacity": 0.8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
    },
  });

  // เพิ่ม popup เมื่อคลิกที่จุดโรงพยาบาล
  map.value.on("click", "hospital-layer", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const hospitalName = e.features[0].properties.Name;

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<h3>${hospitalName}</h3>`)
      .addTo(map.value);
  });

  // เปลี่ยน cursor เมื่อ hover บนจุดโรงพยาบาล
  map.value.on("mouseenter", "hospital-layer", () => {
    map.value.getCanvas().style.cursor = "pointer";
  });

  map.value.on("mouseleave", "hospital-layer", () => {
    map.value.getCanvas().style.cursor = "";
  });

  // เพิ่ม GeoJSON source สำหรับโรงพยาบาลขนาดใหญ่
  map.value.addSource("big-hospital-points", {
    type: "geojson",
    data: bigHospitalData,
  });

  // เพิ่ม layer แสดงรัศมีรอบโรงพยาบาลขนาดใหญ่
  map.value.addLayer({
    id: "big-hospital-radius",
    type: "circle",
    source: "big-hospital-points",
    paint: {
      "circle-radius": {
        stops: [
          [0, 0],
          [20, metersToPixelsAtMaxZoom(15000, 17.991376)],
        ],
        base: 2,
      },
      "circle-color": "#0000FF",
      "circle-opacity": 0.2,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#0000FF",
    },
  });

  // เพิ่ม layer แสดงจุดโรงพยาบาลขนาดใหญ่
  map.value.addLayer({
    id: "big-hospital-layer",
    type: "circle",
    source: "big-hospital-points",
    paint: {
      "circle-radius": 7,
      "circle-color": "#0000FF", // สีน้ำเงินสำหรับโรงพยาบาลขนาดใหญ่
      "circle-opacity": 0.8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
    },
  });

  // เพิ่ม popup เมื่อคลิกที่จุดโรงพยาบาลขนาดใหญ่
  map.value.on("click", "big-hospital-layer", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const hospitalName = e.features[0].properties.NAME;

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<h3>${hospitalName}</h3>`)
      .addTo(map.value);
  });

  // เปลี่ยน cursor เมื่อ hover บนจุดโรงพยาบาลขนาดใหญ่
  map.value.on("mouseenter", "big-hospital-layer", () => {
    map.value.getCanvas().style.cursor = "pointer";
  });

  map.value.on("mouseleave", "big-hospital-layer", () => {
    map.value.getCanvas().style.cursor = "";
  });

  // Add subdistrict boundary layer
  map.value.addSource("subdistrict-boundary", {
    type: "geojson",
    data: subdistrictData,
  });

  map.value.addLayer({
    id: "subdistrict-layer",
    type: "line",
    source: "subdistrict-boundary",
    paint: {
      "line-color": "#800080", // สีม่วงสำหรับขอบเขตตำบล
      "line-width": 1,
    },
    layout: {
      visibility: "none",
    },
  });

  // Add SM boundary layer
  map.value.addSource("sm-boundary", {
    type: "geojson",
    data: smData,
  });

  map.value.addLayer({
    id: "sm-layer",
    type: "fill",
    source: "sm-boundary",
    paint: {
      "fill-color": "#FFFF00",
      "fill-opacity": 0.3,
      "fill-outline-color": "#006400",
    },
    layout: {
      visibility: layers.value.smBoundary ? "visible" : "none",
    },
  });

  map.value.addLayer({
    id: "sm-labels",
    type: "symbol",
    source: "sm-boundary",
    layout: {
      "text-field": ["get", "mun_n_t"],
      "text-size": 12,
      "text-anchor": "center",
      "text-justify": "center",
      visibility: layers.value.smBoundary ? "visible" : "none",
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
    },
  });

  // Add SAO boundary layer
  map.value.addSource("sao-boundary", {
    type: "geojson",
    data: saoData,
  });

  map.value.addLayer({
    id: "sao-layer",
    type: "fill",
    source: "sao-boundary",
    paint: {
      "fill-color": "#800080",
      "fill-opacity": 0.3,
      "fill-outline-color": "#4B0082",
    },
    layout: {
      visibility: layers.value.saoBoundary ? "visible" : "none",
    },
  });

  // Add text labels for SAO areas
  map.value.addLayer({
    id: "sao-labels",
    type: "symbol",
    source: "sao-boundary",
    layout: {
      "text-field": ["get", "abt_name_t"],
      "text-size": 12,
      "text-anchor": "center",
      "text-justify": "center",
      visibility: layers.value.saoBoundary ? "visible" : "none",
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
    },
  });
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
};

const metersToPixelsAtMaxZoom = (meters, latitude) =>
  meters / 0.075 / Math.cos((latitude * Math.PI) / 180);

onMounted(() => {
  initializeMap();
});
</script>

<style scoped>
/* Add any additional styles */
.layer-selection {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
