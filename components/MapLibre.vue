<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script>
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default {
  props: {
    mapStyle: {
      type: String,
      required: true,
    },
    center: {
      type: Array,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
    features: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      map: null,
    };
  },
  watch: {
    features: {
      handler(newFeatures) {
        if (this.map && this.map.getSource("featuresSource")) {
          this.map.getSource("featuresSource").setData({
            type: "FeatureCollection",
            features: newFeatures,
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new maplibregl.Map({
        container: this.$refs.mapContainer,
        style: this.mapStyle,
        center: this.center,
        zoom: this.zoom,
      });

      this.map.on("load", () => {
        // Add GeoJSON source
        this.map.addSource("featuresSource", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: this.features,
          },
        });

        // Add layers for each geometry type
        this.addPointLayer();
        this.addPolygonLayer();
        this.addLineStringLayer();
      });
    },
    addPointLayer() {
      this.map.addLayer({
        id: "pointLayer",
        type: "circle",
        source: "featuresSource",
        filter: ["==", "$type", "Point"], // Only draw Point features
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    },
    addPolygonLayer() {
      this.map.addLayer({
        id: "polygonLayer",
        type: "fill",
        source: "featuresSource",
        filter: ["==", "$type", "Polygon"], // Only draw Polygon features
        paint: {
          "fill-color": "#ff6a13",
          "fill-opacity": 0.6,
        },
      });

      this.map.addLayer({
        id: "polygonBorders",
        type: "line",
        source: "featuresSource",
        filter: ["==", "$type", "Polygon"], // Only draw Polygon features
        paint: {
          "line-color": "#ff6a13",
          "line-width": 2,
        },
      });
    },
    addLineStringLayer() {
      this.map.addLayer({
        id: "lineLayer",
        type: "line",
        source: "featuresSource",
        filter: ["==", "$type", "LineString"], // Only draw LineString features
        paint: {
          "line-color": "#0077ff",
          "line-width": 3,
        },
      });
    },
    fitBoundingBox(bbox) {
      if (this.map) {
        // ถ้าเป็น point ให้ใช้ flyTo แทน fitBounds
        if (bbox[0][0] === bbox[1][0] && bbox[0][1] === bbox[1][1]) {
          this.map.flyTo({
            center: bbox[0],
            zoom: 14,
          });
        } else {
          // ถ้าเป็น geometry อื่นๆ ใช้ fitBounds เหมือนเดิม
          this.map.fitBounds(bbox, { padding: 14 });
        }
      }
    },
  },
};
</script>
