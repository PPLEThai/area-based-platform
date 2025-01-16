<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>
    <div class="absolute top-4 left-4 z-10 bg-white p-2 shadow-md rounded">
      <button
        @click="toggleMeasurement"
        class="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        {{ isMeasuring ? "Stop Measuring" : "Start Measuring" }}
      </button>
      <div v-if="measurementResult" class="mt-2 text-sm text-gray-800">
        <p v-if="measurementType === 'line'">Distance: {{ measurementResult }} meters</p>
        <p v-if="measurementType === 'polygon'">Area: {{ measurementResult }} m²</p>
      </div>
    </div>
  </div>
</template>

<script>
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default {
  data() {
    return {
      map: null,
      isMeasuring: false,
      measurementType: "line", // Options: 'line' or 'polygon'
      measurementResult: null,
      drawnFeatures: [],
    };
  },
  mounted() {
    this.initializeMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    initializeMap() {
      this.map = new maplibregl.Map({
        container: this.$refs.mapContainer,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: [100.523186, 13.736717], // Default center (Bangkok)
        zoom: 12,
      });

      this.map.on("load", () => {
        this.addDrawingLayer();
      });

      this.map.addControl(new maplibregl.NavigationControl(), "top-right");
    },
    addDrawingLayer() {
      this.map.addSource("measurement", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      this.map.addLayer({
        id: "measurement-line",
        type: "line",
        source: "measurement",
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
        },
        filter: ["==", "$type", "LineString"],
      });

      this.map.addLayer({
        id: "measurement-polygon",
        type: "fill",
        source: "measurement",
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.5,
        },
        filter: ["==", "$type", "Polygon"],
      });
    },
    toggleMeasurement() {
      this.isMeasuring = !this.isMeasuring;

      if (this.isMeasuring) {
        this.startMeasuring();
      } else {
        this.stopMeasuring();
      }
    },
    startMeasuring() {
      this.drawnFeatures = [];
      this.measurementResult = null;

      this.map.on("click", this.addPoint);
      this.map.on("dblclick", this.finishMeasurement);
    },
    stopMeasuring() {
      this.map.off("click", this.addPoint);
      this.map.off("dblclick", this.finishMeasurement);
    },
    addPoint(e) {
      const { lng, lat } = e.lngLat;

      this.drawnFeatures.push([lng, lat]);

      const geojsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: this.measurementType === "line" ? "LineString" : "Polygon",
              coordinates:
                this.measurementType === "line"
                  ? this.drawnFeatures
                  : [this.drawnFeatures],
            },
          },
        ],
      };

      this.map.getSource("measurement").setData(geojsonData);

      if (this.measurementType === "line") {
        this.measurementResult = this.calculateDistance(this.drawnFeatures);
      } else if (this.measurementType === "polygon") {
        this.measurementResult = this.calculateArea(this.drawnFeatures);
      }
    },
    finishMeasurement() {
      this.stopMeasuring();
    },
    calculateDistance(coordinates) {
      let distance = 0;

      for (let i = 1; i < coordinates.length; i++) {
        const [lng1, lat1] = coordinates[i - 1];
        const [lng2, lat2] = coordinates[i];

        const R = 6371000; // Earth's radius in meters
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance += R * c;
      }

      return distance.toFixed(2); // Return distance in meters
    },
    calculateArea(coordinates) {
      const coords = coordinates.concat([coordinates[0]]);
      let area = 0;

      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[i + 1];
        area += x1 * y2 - x2 * y1;
      }

      return Math.abs(area / 2).toFixed(2); // Return area in square meters
    },
  },
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
