<template>
    <div id="map" ref="mapContainer" class="w-full h-screen"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import maplibre from 'maplibre-gl';

const mapContainer = ref(null);

onMounted(() => {
    const map = new maplibre.Map({
        container: mapContainer.value,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=cQX2iET1gmOW38bedbUh',
        center: [100.523186, 13.736717], // Bangkok
        zoom: 5,
    });
});
</script>

<style scoped>
#map {
    height: 90%;
    width: 100%;
}

.maplibregl-ctrl-bottom-right {
    display: none;
}
</style>