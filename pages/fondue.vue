<template>
    <div class="w-full h-full flex">
        <div class="w-full h-full relative">
            <!-- Map Component -->
            <MapLibreFullMap ref="map" :mapStyle="mapStyle" :center="[100.523186, 13.736717]" :zoom="10"
                @mapLoaded="onMapLoaded" />
            
            <!-- Loading Overlay -->
            <div v-if="isLoading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <div class="flex flex-col items-center">
                        <!-- ใช้ Flowbite Spinner แทน -->
                        <div role="status" class="mb-4">
                            <svg aria-hidden="true" class="w-12 h-12 text-gray-200 animate-pulse dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span class="sr-only">กำลังโหลด...</span>
                        </div>
                        <p class="text-gray-700">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import maplibregl from 'maplibre-gl';

const toast = useToast();
const mapStyle = ref("https://basemaps.cartocdn.com/gl/positron-gl-style/style.json");
const mapInstance = ref(null);
const geojsonUrl = "https://publicapi.traffy.in.th/teamchadchart-stat-api/geojson/v1";
const isLoading = ref(false);

// Function to load GeoJSON data
const loadGeoJsonData = async () => {
    isLoading.value = true;
    try {
        const response = await fetch(geojsonUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        isLoading.value = false;
        return data;
    } catch (error) {
        console.error("Error loading GeoJSON:", error);
        toast.error("ไม่สามารถโหลดข้อมูลได้");
        isLoading.value = false;
        throw error;
    }
};

// Function to add map layers
const addMapLayers = (map, data) => {
    // Add GeoJSON data source
    map.addSource("traffy-geojson", {
        type: "geojson",
        data: data,
    });

    // Add a layer to visualize the GeoJSON
    map.addLayer({
        id: "traffy-layer",
        type: "circle",
        source: "traffy-geojson",
        paint: {
            "circle-radius": 6,
            "circle-color": "#ff6a13",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
        },
    });

    // เพิ่ม click event listener
    map.on('click', 'traffy-layer', (e) => {
        if (!e.features.length) return;

        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const description = feature.properties.description || 'ไม่มีคำอธิบาย';
        const problemType = Array.isArray(feature.properties.problem_type_fondue) 
            ? feature.properties.problem_type_fondue.join(', ') 
            : 'ไม่ระบุประเภทปัญหา';
        const subdistrict = feature.properties.subdistrict || 'ไม่ระบุแขวง';
        const district = feature.properties.district || 'ไม่ระบุเขต';
        const photoUrl = feature.properties.photo_url;

        // สร้าง popup content
        const popupContent = `
            <div class="p-4">
                <p class="font-bold mb-2 text-lg">ประเภทปัญหา: ${problemType}</p>
                <p class="mb-2">รายละเอียด: ${description}</p>
                <p class="mb-2">แขวง${subdistrict} เขต${district}</p>
                ${photoUrl ? `<img src="${photoUrl}" alt="รูปภาพปัญหา" class="w-full h-auto mt-4 rounded shadow-lg">` : ''}
            </div>
        `;

        // สร้างและแสดง popup
        new maplibregl.Popup({
            maxWidth: '500px', // เพิ่มความกว้างสูงสุดของ popup
            className: 'custom-popup' // เพิ่ม class สำหรับการปรับแต่งเพิ่มเติม
        })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
    });

    // เปลี่ยน cursor เมื่อ hover บนหมุด
    map.on('mouseenter', 'traffy-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'traffy-layer', () => {
        map.getCanvas().style.cursor = '';
    });
};

// Map loaded handler
const onMapLoaded = async (map) => {
    mapInstance.value = map;
    try {
        const geojsonData = await loadGeoJsonData();
        addMapLayers(map, geojsonData);
        toast.success("ดึงข้อมูลสำเร็จ!");
    } catch (error) {
        console.error("Error setting up map:", error);
        toast.error("เกิดข้อผิดพลาดในการตั้งค่าแผนที่");
    }
};
</script>

<style scoped>
.maplibregl-popup {
    max-width: 500px;
    min-width: 300px;
}

.maplibregl-popup-content {
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* เพิ่มสไตล์สำหรับ custom popup */
:deep(.custom-popup) {
    font-size: 14px;
    line-height: 1.5;
}

:deep(.custom-popup img) {
    max-height: 300px;
    max-width: 300px;
    object-fit: cover;
}

/* ใช้ animate-pulse จาก Tailwind แทน animate-spin */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: .5;
    }
}
</style>
