<template>
  <div class="w-full h-full flex">
    <div class="w-full h-full relative">
      <!-- Map Component -->
      <MapLibreFullMap ref="map" :mapStyle="mapStyle" :center="[100.523186, 13.736717]" :zoom="10"
        @mapLoaded="onMapLoaded" />

      <!-- Menu Card Overlay -->
      <div class="absolute bottom-10 left-4 bg-white shadow-lg rounded-lg p-4 w-80">
        <div class="flex flex-row justify-between items-center mb-4">
          <h3 class="text-lg font-bold">สรุปข้อมูล</h3>
          <button class="" @click="toggleMenuCard">
            <svg v-if="showMenuCard" width="18" height="18" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.9998 16.7501C11.8008 16.751 11.6097 16.6717 11.4698 16.5301L3.46985 8.53009C3.19449 8.23458 3.20261 7.77408 3.48823 7.48847C3.77384 7.20286 4.23434 7.19473 4.52985 7.47009L11.9998 14.9401L19.4698 7.47009C19.7654 7.19473 20.2259 7.20286 20.5115 7.48847C20.7971 7.77408 20.8052 8.23458 20.5298 8.53009L12.5298 16.5301C12.39 16.6717 12.1989 16.751 11.9998 16.7501Z"
                fill="black" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.9998 16.7501C19.8008 16.751 19.6097 16.6717 19.4698 16.5301L11.9998 9.06007L4.52985 16.5301C4.23434 16.8054 3.77384 16.7973 3.48823 16.5117C3.20261 16.2261 3.19449 15.7656 3.46985 15.4701L11.4698 7.47007C11.7627 7.17762 12.237 7.17762 12.5298 7.47007L20.5298 15.4701C20.8223 15.7629 20.8223 16.2373 20.5298 16.5301C20.39 16.6717 20.1989 16.751 19.9998 16.7501Z"
                fill="black" />
            </svg>
          </button>
        </div>

        <ul v-if="showMenuCard">
          <li v-for="(category, index) in statistics" :key="index" class="flex justify-between items-center mb-2">
            <div class="flex items-center">
              <span class="inline-block w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: category.color }"></span>
              {{ category.name }}
            </div>
            <span class="font-medium text-gray-700">{{ category.count }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as Terraformer from "@terraformer/wkt";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import { useToast } from "vue-toastification";
import { useCategories } from "@/composables/useCategories";
import { Popup } from "maplibre-gl"; // Import Popup from MapLibre

const toast = useToast();
const categoryList = useCategories();

const mapStyle = ref("https://api.maptiler.com/maps/streets-v2/style.json?key=DMl4AxokgMPvgzLikrFx");
const mapInstance = ref(null);

const statistics = reactive([]);
const showMenuCard = ref(true);

const onMapLoaded = async (map) => {
  mapInstance.value = map; // Store the MapLibre instance
  console.log("Map loaded and instance set."); // Debugging log
  await fetchUrbanIssues(); // Fetch and render the data after the map is ready
};

const checkCategoryColor = (id) => {
  for (const category of categoryList) {
    if (category.id === id) {
      return category.color;
    }
  }
  return "#000000"; // Default color if no match is found
};

const fetchUrbanIssues = async () => {
  try {
    const { getUrbanIssues } = useUrbanIssues();
    const response = await getUrbanIssues({ all: "true" });
    await drawGeometryWithImage(response);

    // Group by category and count issues
    const groupedIssues = response.data.reduce((acc, issue) => {
      const category = categoryList.find((cat) => cat.id === issue.cat_id);
      if (category) {
        if (!acc[category.id]) {
          acc[category.id] = { name: category.name, color: category.color, count: 0 };
        }
        acc[category.id].count += 1;
      }
      return acc;
    }, {});

    // Update statistics
    Object.values(groupedIssues).forEach((stat) => statistics.push(stat));
  } catch (error) {
    toast.error("ไม่สามารถดึงข้อมูลได้ โปรดลองใหม่อีกครั้ง");
  }
};

const drawGeometryWithImage = async (geomList) => {
  // Iterate through the geometry list
  for (const element of geomList.data) {
    const geojson = Terraformer.wktToGeoJSON(element.geom); // Convert WKT to GeoJSON
    const sourceId = `source-${element.id}`;
    const layerId = `layer-${element.id}`;
    const iconId = `icon-${element.sub_id}`; // Unique icon ID
    const iconUrl = `/images/icons/${element.sub_id}.png`;

    // Ensure the source is added or updated
    if (mapInstance.value.getSource(sourceId)) {
      mapInstance.value.getSource(sourceId).setData(geojson);
    } else {
      mapInstance.value.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // Add the custom icon only if it doesn't already exist
      if (geojson.type === "Point") {
        await addCustomIcon(iconId, iconUrl);
      }

      // Add geometry layers
      if (geojson.type === "Point") {
        // For point geometries (markers)
        if (!mapInstance.value.getLayer(layerId)) {
          mapInstance.value.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            layout: {
              "icon-image": iconId, // Use the custom icon ID
              "icon-size": 0.2, // Adjust size as needed
            },
          });
        }
      } else if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
        // For polygon geometries
        mapInstance.value.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": checkCategoryColor(element.cat_id),
            "fill-opacity": 0.5,
          },
        });

        // Add a layer for borders
        mapInstance.value.addLayer({
          id: `${layerId}-border`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": checkCategoryColor(element.cat_id),
            "line-width": 2,
          },
        });
      } else if (geojson.type === "LineString" || geojson.type === "MultiLineString") {
        // For line geometries
        mapInstance.value.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": checkCategoryColor(element.cat_id),
            "line-width": 2,
          },
        });
      }

      // Add event listeners for all geometries
      mapInstance.value.on("click", layerId, (event) => {
        // Get the clicked feature's properties
        const properties = element;
        const coordinates = event.lngLat; // Use event.lngLat for point coordinates

        showPopup(properties, coordinates);
      });

      // Change cursor to pointer when hovering over any geometry
      mapInstance.value.on("mouseenter", layerId, () => {
        mapInstance.value.getCanvas().style.cursor = "pointer";
      });

      mapInstance.value.on("mouseleave", layerId, () => {
        mapInstance.value.getCanvas().style.cursor = "";
      });
    }
  }
};

// Function to display geometry details
const showPopup = (properties, coordinates) => {
  // Create a new popup
  console.log(properties)
  const popup = new Popup({ offset: 15 }) // Adjust offset as needed
    .setLngLat([coordinates.lng, coordinates.lat])
    .setHTML(`
      <div>
        <h3><strong>${properties.name}</strong></h3>
        <p><strong>หมวดหมู่ย่อย:</strong> ${properties.sub_name}</p>
        <p><strong>รายละเอียด:</strong> ${properties.detail}</p>
        <p><strong>นำเข้าข้อมูลเมื่อ:</strong> ${new Date(properties.created).toLocaleString()}</p>
      </div>
    `)
    .addTo(mapInstance.value); // Add the popup to the map
};

const addCustomIcon = async (iconId, iconUrl) => {
  if (!mapInstance.value.hasImage(iconId)) {
    try {
      const image = await mapInstance.value.loadImage(iconUrl);
      mapInstance.value.addImage(iconId, image.data);
    } catch (error) {
      console.error(`Error adding custom icon: ${iconId}`, error);
    }
  }
};

const toggleMenuCard = () => {
  showMenuCard.value = !showMenuCard.value;
};
</script>

<style scoped>
.menu-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.menu-card h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.menu-card ul {
  list-style: none;
  padding: 0;
}

.menu-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.menu-card li:last-child {
  margin-bottom: 0;
}

.menu-card span {
  font-weight: bold;
}
</style>