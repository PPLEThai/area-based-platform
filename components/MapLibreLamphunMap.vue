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

    <!-- Legend -->
    <div class="legend bg-white p-4 rounded shadow-lg absolute bottom-4 left-4 z-10">
      <h3 class="font-bold mb-2">Legend</h3>
      <div class="flex items-center mb-2">
        <span class="inline-block w-4 h-4 mr-2 bg-red-500"></span>
        <span>หมู่บ้าน</span>
      </div>
      <div class="flex items-center mb-2">
        <span class="inline-block w-4 h-4 mr-2 bg-blue-500 opacity-50"></span>
        <span>น้ำท่วม</span>
      </div>
    </div>

    <!-- Layer Selection -->
    <!-- <LayerSelection @update:layers="handleLayerUpdate" /> -->

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import villageData from '@/assets/data/lamphun_village.json';
import floodData from '@/assets/data/lamphun_flood.json';
import { useLamphunBoundary, useLamphunDistrictBoundary } from "@/composables/useBoundary";
import LayerSelection from './LayerSelection.vue';

const props = defineProps({
  mapStyle: {
    type: String,
    required: true,
    default: "https://api.maptiler.com/maps/darkmatter/style.json?key=DMl4AxokgMPvgzLikrFx",
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

const { getLamphunBoundaryData } = useLamphunBoundary();
const { getLamphunDistrictBoundaryData } = useLamphunDistrictBoundary();
const lamphunBoundaryData = getLamphunBoundaryData();
const lamphunDistrictBoundary = getLamphunDistrictBoundaryData();

const emit = defineEmits(["mapLoaded"]);
const map = ref(null);
const mapContainer = ref(null);
const searchQuery = ref("");
const searchResults = ref([]);
const errorMessage = ref("");

// Layer visibility state
const layers = ref({
  districtBoundary: true,
  lamphunBoundary: true,
});

// Watch for layer visibility changes
watch(
  () => layers.value,
  (newLayers) => {
    if (!map.value) return;

    // Toggle district boundary layer
    const districtOpacity = newLayers.districtBoundary ? 0.4 : 0;
    map.value.setPaintProperty(
      'district-boundary-layer',
      'line-opacity',
      districtOpacity
    );

    // Toggle BKK boundary layer
    const lamphunOpacity = newLayers.lamphunBoundary ? 1 : 0;
    map.value.setPaintProperty(
      'lamphun-boundary-layer',
      'line-opacity',
      lamphunOpacity
    );
  },
  { deep: true }
);

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

const handleLayerUpdate = ({ community, districtBoundary, bkkBoundary }) => {
  if (!map.value) return;

  // จัดการ community layer
  if (community) {
    // ถ้ายังไม่มี source ให้เพิ่มใหม่
    if (!map.value.getSource('community-points')) {
      map.value.addSource('community-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: community.data.map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [item.longitude, item.latitude]
            },
            properties: {
              name: item.name,
              type_id: item.type_id
            }
          }))
        }
      });

      // เพิ่ม layer ถ้ายังไม่มี
      if (!map.value.getLayer('community-layer')) {
        map.value.addLayer({
          id: 'community-layer',
          type: 'circle',
          source: 'community-points',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'match',
              ['get', 'type_id'],
              1, '#FF0000',  // ประเภท 1 - สีแดง
              2, '#00FF00',  // ประเภท 2 - สีเขียว
              3, '#0000FF',  // ประเภท 3 - สีน้ำเงิน
              4, '#FFFF00',  // ประเภท 4 - สีเหลือง
              5, '#FF00FF',  // ประเภท 5 - สีม่วง
              6, '#00FFFF',  // ประเภท 6 - สีฟ้า
              '#888888'      // ค่าอื่นๆ - สีเทา
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          },
          layout: {
            'visibility': 'none' // Set initial visibility to none
          }
        });

        // เพิ่ม popup และ events
        map.value.on('click', 'community-layer', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const name = e.features[0].properties.name;
          
          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<h3>${name}</h3>`)
            .addTo(map.value);
        });

        map.value.on('mouseenter', 'community-layer', () => {
          map.value.getCanvas().style.cursor = 'pointer';
        });
        
        map.value.on('mouseleave', 'community-layer', () => {
          map.value.getCanvas().style.cursor = '';
        });
      }
    }

    // ปรับการแสดงผล layer
    map.value.setLayoutProperty(
      'community-layer',
      'visibility',
      community.visible ? 'visible' : 'none'
    );
  }

  // จัดการ district boundary layer
  if (map.value.getLayer('district-boundary-layer')) {
    const districtOpacity = districtBoundary ? 0.4 : 0;
    map.value.setPaintProperty(
      'district-boundary-layer',
      'line-opacity',
      districtOpacity
    );
  }

  // จัดการ BKK boundary layer
  if (map.value.getLayer('bkk-boundary-layer')) {
    const bkkOpacity = bkkBoundary ? 1 : 0;
    map.value.setPaintProperty(
      'bkk-boundary-layer',
      'line-opacity',
      bkkOpacity
    );
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
      data: lamphunDistrictBoundary,
    });

    map.value.addSource("lamphun-boundary", {
      type: "geojson",
      data: lamphunBoundaryData,
    });

    // Add flood data source
    map.value.addSource("flood-area", {
      type: "geojson", 
      data: floodData
    });

    // Add flood layer
    map.value.addLayer({
      id: "flood-layer",
      type: "fill",
      source: "flood-area",
      paint: {
        "fill-color": "#0066ff",
        "fill-opacity": 0.5,
        "fill-outline-color": "#0044aa"
      }
    });

    // Add boundary layers
    map.value.addLayer({
      id: "lamphun-boundary-layer",
      type: "line",
      source: "lamphun-boundary",
      paint: {
        "line-color": "#ff6a13",
        "line-width": 2,
        "line-opacity": layers.value.lamphunBoundary ? 1 : 0,
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
    map.value.addSource('village-points', {
      type: 'geojson',
      data: villageData
    });

    // เพิ่ม layer แสดงจุดหมู่บ้าน
    map.value.addLayer({
      id: 'village-layer',
      type: 'circle',
      source: 'village-points',
      paint: {
        'circle-radius': 3,
        'circle-color': '#FF0000', // สีแดงสำหรับหมู่บ้าน
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    });

    // เพิ่ม popup เมื่อคลิกที่จุดหมู่บ้าน
    map.value.on('click', 'village-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const villageName = e.features[0].properties.v_name_t;
      
      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<h3>${villageName}</h3>`)
        .addTo(map.value);
    });

    // เปลี่ยน cursor เมื่อ hover บนจุดหมู่บ้าน
    map.value.on('mouseenter', 'village-layer', () => {
      map.value.getCanvas().style.cursor = 'pointer';
    });
    
    map.value.on('mouseleave', 'village-layer', () => {
      map.value.getCanvas().style.cursor = '';
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

.legend {
  min-width: 150px;
}

.legend span {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 50%;
}
</style>
