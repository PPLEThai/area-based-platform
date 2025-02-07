<template>
  <div class="relative w-full h-full">
    <SearchBox @select-result="selectResult" />

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
  initialGeom: {
    type: [Object, String],
    default: null,
  },
});

// Import the custom composable
// import { useBkkBoundary } from "@/composables/useBoundary";
// const { getBkkBoundaryData } = useBkkBoundary(); // Extract the function
// const bkkBoundaryData = getBkkBoundaryData(); // Load the boundary data

// Emits
const emit = defineEmits(["features-updated"]);

// Reactive variables
const mapContainer = ref(null); // Reference to the map container
const map = ref(null);
const drawControl = ref(null);
const features = ref([]);
const marker = ref(null);

// search display
const searchQuery = ref("");
const searchResults = ref([]);
const errorMessage = ref("");
const currentMarker = ref(null);

const config = useRuntimeConfig();
const mapKey = config.public.apiMapKey;

// Initialize Map
const initializeMap = async () => {
  await nextTick();

  if (!mapContainer.value) return;

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: props.mapStyle,
    center: props.center,
    zoom: props.zoom,
  });

  drawControl.value = new MaplibreTerradrawControl({
    modes: [
      "render",
      "point",
      "linestring",
      "polygon",
      "select",
      "delete-selection",
      "delete",
    ],
    open: true,
  });

  map.value.addControl(drawControl.value, "top-right");

  map.value.on("load", function () {
    // drawBkkBoundary();

    if (props.initialGeom) {
      let geojsonFeature;

      if (typeof props.initialGeom === "string") {
        // Handle WKT string
        try {
          const wkt = props.initialGeom;
          geojsonFeature = {
            type: "Feature",
            geometry: wktToGeoJSON(wkt),
            properties: {},
          };
        } catch (error) {
          console.error("Error converting WKT:", error);
          return;
        }
      } else {
        // Handle GeoJSON object
        geojsonFeature = props.initialGeom;
      }

      if (geojsonFeature.geometry.type === "Point") {
        // If it's a point, create a draggable marker
        const coordinates = geojsonFeature.geometry.coordinates;
        marker.value = new maplibregl.Marker({
          draggable: true,
        })
          .setLngLat(coordinates)
          .addTo(map.value);

        // Update features when marker is dragged
        marker.value.on("dragend", () => {
          const lngLat = marker.value.getLngLat();
          const pointFeature = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lngLat.lng, lngLat.lat],
            },
            properties: {},
          };
          features.value = [pointFeature];
          emit("features-updated", features.value);
        });
      } else if (geojsonFeature.geometry.type === "LineString") {
        // Add source and layer for LineString
        const drawInstance = drawControl.value.getTerraDrawInstance();
        drawInstance?.addFeatures([
          {
            ...geojsonFeature,
            properties: {
              mode: "linestring",
              selected: true,
            },
          },
        ]);

        features.value = [geojsonFeature];
        emit("features-updated", features.value);
      } else if (geojsonFeature.geometry.type === "Polygon") {
        const drawInstance = drawControl.value.getTerraDrawInstance();
        drawInstance?.addFeatures([
          {
            ...geojsonFeature,
            properties: {
              mode: "polygon",
              selected: true,
            },
          },
        ]);
        features.value = [geojsonFeature];
        emit("features-updated", features.value);
      }

      const bounds = getBounds(geojsonFeature.geometry);
      if (bounds) {
        map.value.fitBounds(bounds, { padding: 50 });
      }
    }
  });

  const drawInstance = drawControl.value.getTerraDrawInstance();
  if (drawInstance) {
    drawInstance.on("change", () => {
      const snapshot = drawInstance.getSnapshot();
      features.value = snapshot;
      emit("features-updated", features.value);
    });
  }
};

// const drawBkkBoundary = () => {
//   map.value.addSource("bkk-boundary", {
//     type: "geojson",
//     data: bkkBoundaryData,
//   });

//   map.value.addLayer({
//     id: "bkk-boundary-layer",
//     type: "line",
//     source: "bkk-boundary",
//     paint: {
//       "line-color": "#ff6a13",
//       "line-width": 2,
//     },
//   });
// };

const getBounds = (geometry) => {
  if (!geometry) return null;

  let coordinates = [];
  if (geometry.type === "Point") {
    coordinates = [geometry.coordinates];
  } else if (geometry.type === "LineString") {
    coordinates = geometry.coordinates;
  } else if (geometry.type === "Polygon") {
    coordinates = geometry.coordinates[0];
  }

  if (coordinates.length === 0) return null;

  const bounds = coordinates.reduce(
    (bounds, coord) => {
      return [
        [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
        [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
      ];
    },
    [
      [coordinates[0][0], coordinates[0][1]],
      [coordinates[0][0], coordinates[0][1]],
    ]
  );

  return bounds;
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

  searchResults.value = [];
  searchQuery.value = "";
};

// Lifecycle Hook
onMounted(() => {
  initializeMap();
});
</script>

<style scoped></style>
