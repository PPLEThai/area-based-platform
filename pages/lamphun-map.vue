<template>
  <div class="w-full h-full flex">
    <div class="w-full h-full relative">
      <!-- Map Component -->
      <MapLibreLamphunMap ref="map" :mapStyle="mapStyle" :center="[98.952368, 17.991376]" :zoom="8.4"
        @mapLoaded="onMapLoaded" />
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
// const mapStyle = ref("https://api.maptiler.com/maps/darkmatter/style.json?key=DMl4AxokgMPvgzLikrFx");
const mapInstance = ref(null);

const statistics = reactive([]);
const showMenuCard = ref(true);

const onMapLoaded = async (map) => {
  mapInstance.value = map; // Store the MapLibre instance
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