<template>
  <div class="relative w-full h-full">
    <SearchBox @select-result="selectResult" />

    <!-- Layer Selection -->
    <LayerSelection @update:layers="handleLayerUpdate" />

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import communityData from "@/assets/data/community.json";
import LayerSelection from "./LayerSelection.vue";
import SearchBox from "@/components/maps/SearchBox.vue";

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

// Layer visibility state
const layers = ref({
  districtBoundary: true,
  bkkBoundary: true,
});

// Watch for layer visibility changes
watch(
  () => layers.value,
  (newLayers) => {
    if (!map.value) return;

    // Toggle district boundary layer
    const districtOpacity = newLayers.districtBoundary ? 0.4 : 0;
    map.value.setPaintProperty(
      "district-boundary-layer",
      "line-opacity",
      districtOpacity
    );

    // Toggle BKK boundary layer
    const bkkOpacity = newLayers.bkkBoundary ? 1 : 0;
    map.value.setPaintProperty("bkk-boundary-layer", "line-opacity", bkkOpacity);
  },
  { deep: true }
);

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

const handleLayerUpdate = ({ community, districtBoundary, bkkBoundary }) => {
  if (!map.value) return;

  // จัดการ community layer
  if (community) {
    // ถ้ายังไม่มี source ให้เพิ่มใหม่
    if (!map.value.getSource("community-points")) {
      map.value.addSource("community-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: community.data.map((item) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [item.longitude, item.latitude],
            },
            properties: {
              name: item.name,
              type_id: item.type_id,
            },
          })),
        },
      });

      // เพิ่ม layer ถ้ายังไม่มี
      if (!map.value.getLayer("community-layer")) {
        map.value.addLayer({
          id: "community-layer",
          type: "circle",
          source: "community-points",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "match",
              ["get", "type_id"],
              1,
              "#FF0000", // ประเภท 1 - สีแดง
              2,
              "#00FF00", // ประเภท 2 - สีเขียว
              3,
              "#0000FF", // ประเภท 3 - สีน้ำเงิน
              4,
              "#FFFF00", // ประเภท 4 - สีเหลือง
              5,
              "#FF00FF", // ประเภท 5 - สีม่วง
              6,
              "#00FFFF", // ประเภท 6 - สีฟ้า
              "#888888", // ค่าอื่นๆ - สีเทา
            ],
            "circle-opacity": 0.8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
          },
          layout: {
            visibility: "none", // Set initial visibility to none
          },
        });

        // เพิ่ม popup และ events
        map.value.on("click", "community-layer", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const name = e.features[0].properties.name;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<h3>${name}</h3>`)
            .addTo(map.value);
        });

        map.value.on("mouseenter", "community-layer", () => {
          map.value.getCanvas().style.cursor = "pointer";
        });

        map.value.on("mouseleave", "community-layer", () => {
          map.value.getCanvas().style.cursor = "";
        });
      }
    }

    // ปรับการแสดงผล layer
    map.value.setLayoutProperty(
      "community-layer",
      "visibility",
      community.visible ? "visible" : "none"
    );
  }

  // จัดการ district boundary layer
  if (map.value.getLayer("district-boundary-layer")) {
    const districtOpacity = districtBoundary ? 0.4 : 0;
    map.value.setPaintProperty(
      "district-boundary-layer",
      "line-opacity",
      districtOpacity
    );
  }

  // จัดการ BKK boundary layer
  if (map.value.getLayer("bkk-boundary-layer")) {
    const bkkOpacity = bkkBoundary ? 1 : 0;
    map.value.setPaintProperty("bkk-boundary-layer", "line-opacity", bkkOpacity);
  }
};

const initializeMap = async () => {
  await nextTick();

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: props.mapStyle,
    center: props.center,
    zoom: props.zoom,
  });

  map.value.on("load", () => {
    emit("mapLoaded", map.value);

    // Add boundary sources
    map.value.addSource("district-boundary", {
      type: "geojson",
      data: bkkDistrictBoundary,
    });

    map.value.addSource("bkk-boundary", {
      type: "geojson",
      data: bkkBoundaryData,
    });

    // Add boundary layers
    map.value.addLayer({
      id: "bkk-boundary-layer",
      type: "line",
      source: "bkk-boundary",
      paint: {
        "line-color": "#ff6a13",
        "line-width": 2,
        "line-opacity": layers.value.bkkBoundary ? 1 : 0,
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

    // เพิ่ม GeoJSON source สำหรับชุมชน
    map.value.addSource("community-points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: communityData.map((community) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [community.longitude, community.latitude],
          },
          properties: {
            name: community.name,
            type_id: community.type_id,
          },
        })),
      },
    });

    // เพิ่ม layer แสดงจุดชุมชน
    map.value.addLayer({
      id: "community-layer",
      type: "circle",
      source: "community-points",
      paint: {
        "circle-radius": 4,
        "circle-color": [
          "match",
          ["get", "type_id"],
          1,
          "#FF0000", // ประเภท 1 - สีแดง - ชุมชนแออัด
          2,
          "#00FF00", // ประเภท 2 - สีเขียว - ชุมชนชานเมือง
          3,
          "#0000FF", // ประเภท 3 - สีน้ำเงิน - ชุมชนหมู่บ้านจัดสรร
          4,
          "#FFFF00", // ประเภท 4 - สีเหลือง - เคหะชุมชน
          5,
          "#FF00FF", // ประเภท 5 - สีม่วง - ชุมชนเมือง
          6,
          "#00FFFF", // ประเภท 6 - สีฟ้า - ชุมชนอาคารสูง
          "#888888", // ค่าอื่นๆ - สีเทา - ไม่ทราบข้อมูล
        ],
        "circle-opacity": 0.8,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
      layout: {
        visibility: "none", // Set initial visibility to none
      },
    });

    // เพิ่ม popup เมื่อคลิกที่จุด
    map.value.on("click", "community-layer", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const name = e.features[0].properties.name;

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<h3>${name}</h3>`)
        .addTo(map.value);
    });

    // เปลี่ยน cursor เมื่อ hover บนจุด
    map.value.on("mouseenter", "community-layer", () => {
      map.value.getCanvas().style.cursor = "pointer";
    });

    map.value.on("mouseleave", "community-layer", () => {
      map.value.getCanvas().style.cursor = "";
    });
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
