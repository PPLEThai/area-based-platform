<template>
    <div class="w-full h-full flex">
        <div class="w-full h-full relative">
            <!-- Map Component -->
            <MapLibreFullMap ref="map" :mapStyle="mapStyle" :center="[100.523186, 13.736717]" :zoom="10"
                @mapLoaded="onMapLoaded" />

            <!-- Legend -->
            <div class="legend bg-white p-4 rounded shadow-lg absolute bottom-4 left-4 z-5">
                <div class="flex flex-row justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">คำอธิบาย</h3>
                    <button class="" @click="toggleMenuCard">
                        <svg v-if="showMenuCard" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11.9998 16.7501C11.8008 16.751 11.6097 16.6717 11.4698 16.5301L3.46985 8.53009C3.19449 8.23458 3.20261 7.77408 3.48823 7.48847C3.77384 7.20286 4.23434 7.19473 4.52985 7.47009L11.9998 14.9401L19.4698 7.47009C19.7654 7.19473 20.2259 7.20286 20.5115 7.48847C20.7971 7.77408 20.8052 8.23458 20.5298 8.53009L12.5298 16.5301C12.39 16.6717 12.1989 16.751 11.9998 16.7501Z"
                                fill="black" />
                        </svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.9998 16.7501C19.8008 16.751 19.6097 16.6717 19.4698 16.5301L11.9998 9.06007L4.52985 16.5301C4.23434 16.8054 3.77384 16.7973 3.48823 16.5117C3.20261 16.2261 3.19449 15.7656 3.46985 15.4701L11.4698 7.47007C11.7627 7.17762 12.237 7.17762 12.5298 7.47007L20.5298 15.4701C20.8223 15.7629 20.8223 16.2373 20.5298 16.5301C20.39 16.6717 20.1989 16.751 19.9998 16.7501Z"
                                fill="black" />
                        </svg>
                    </button>
                </div>
                <ul v-if="showMenuCard">
                    <li v-for="(color, type) in colorMap" :key="type" 
                        class="flex items-center mb-1 cursor-pointer hover:bg-gray-100 rounded"
                        :class="{ 'bg-gray-200': selectedTypes.includes(type) }"
                        @click="toggleTypeFilter(type)">
                        <span :style="{ backgroundColor: color }" class="w-4 h-4 inline-block mr-2"></span>
                        {{ type }}
                    </li>
                </ul>
            </div>

            <!-- Loading Overlay -->
            <div v-if="isLoading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <div class="flex flex-col items-center">
                        <!-- ใช้ Flowbite Spinner แทน -->

                        <div role="status">
                            <svg aria-hidden="true"
                                class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor" />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill" />
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>

                        <p class="text-gray-700 mt-4">กำลังโหลดข้อมูล...</p>
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
const showMenuCard = ref(true);
const selectedTypes = ref([]);

// Color map for legend
const colorMap = {
    'ไฟฟ้า': '#FFA500',        // สีส้ม
    'ถนน': '#FF0000',         // สีแดง
    'ทางเท้า': '#800080',      // สีม่วง
    'ผิดกฎจราจร': '#FF4444',   // สีแดงอ่อน
    'เสียง': '#4B0082',        // สีน้ำเงินเข้ม
    'ความสะอาด': '#008000',    // สีเขียว
    'อื่นๆ': '#808080',        // สีเทา
    'ฝุ่นควัน&กลิ่น&PM2.5': '#A52A2A', // สีน้ำตาล
    'หาบเร่แผงลอย': '#FFD700',  // สีเหลือง
    'อุปกรณ์ชำรุด': '#4169E1',  // สีน้ำเงิน
    'ต้นไม้': '#228B22',        // สีเขียวเข้ม
    'สัตว์': '#8B4513',         // สีน้ำตาลเข้ม
    'สายสื่อสาร': '#FF69B4',    // สีชมพู
    'คนเร่ร่อน': '#9370DB',     // สีม่วงอ่อน
    'ป้ายโฆษณา': '#20B2AA',     // สีฟ้าอมเขียว
    'อาคารสถานที่ชำรุด': '#CD853F', // สีน้ำตาลอ่อน
    'อื่นๆ': '#666666', // สีเทาเข้มสำหรับประเภทที่ไม่ได้กำหนด
};

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
            "circle-color": [
                "match",
                ["at", 0, ["get", "problem_type_fondue"]],
                "ไฟฟ้า", "#FFA500",
                "ถนน", "#FF0000",
                "ทางเท้า", "#800080",
                "ผิดกฎจราจร", "#FF4444",
                "เสียง", "#4B0082",
                "ความสะอาด", "#008000",
                "อื่นๆ", "#808080",
                "ฝุ่นควัน&กลิ่น&PM2.5", "#A52A2A",
                "หาบเร่แผงลอย", "#FFD700",
                "อุปกรณ์ชำรุด", "#4169E1",
                "ต้นไม้", "#228B22",
                "สัตว์", "#8B4513",
                "สายสื่อสาร", "#FF69B4",
                "คนเร่ร่อน", "#9370DB",
                "ป้ายโฆษณา", "#20B2AA",
                "อาคารสถานที่ชำรุด", "#CD853F",
                "#666666" // สีเริ่มต้นสำหรับประเภทที่ไม่ได้กำหนด
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": [
                "case",
                ["==", ["length", ["literal", selectedTypes.value]], 0],
                1,
                ["in", ["at", 0, ["get", "problem_type_fondue"]], ["literal", selectedTypes.value]],
                1,
                0
            ],
            "circle-stroke-opacity": [
                "case",
                ["==", ["length", ["literal", selectedTypes.value]], 0],
                1,
                ["in", ["at", 0, ["get", "problem_type_fondue"]], ["literal", selectedTypes.value]],
                1,
                0
            ]
        },
    });

    // เพิ่ม click event listener
    map.on('click', 'traffy-layer', (e) => {
        if (!e.features.length) return;

        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const description = feature.properties.description || 'ไม่มีคำอธิบาย';

        // Convert string to array if needed since API returns stringified array
        const problemTypeValue = feature.properties.problem_type_fondue;
        const problemTypeArray = typeof problemTypeValue === 'string'
            ? JSON.parse(problemTypeValue)
            : problemTypeValue;

        const problemType = Array.isArray(problemTypeArray)
            ? problemTypeArray.join(', ')
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
            maxWidth: '500px',
            className: 'custom-popup'
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

const toggleTypeFilter = (type) => {
    const index = selectedTypes.value.indexOf(type);
    if (index === -1) {
        selectedTypes.value.push(type);
    } else {
        selectedTypes.value.splice(index, 1);
    }
    
    if (mapInstance.value) {
        mapInstance.value.setPaintProperty('traffy-layer', 'circle-opacity', [
            "case",
            ["==", ["length", ["literal", selectedTypes.value]], 0],
            1,
            ["in", ["at", 0, ["get", "problem_type_fondue"]], ["literal", selectedTypes.value]],
            1,
            0
        ]);
        mapInstance.value.setPaintProperty('traffy-layer', 'circle-stroke-opacity', [
            "case",
            ["==", ["length", ["literal", selectedTypes.value]], 0],
            1,
            ["in", ["at", 0, ["get", "problem_type_fondue"]], ["literal", selectedTypes.value]],
            1,
            0
        ]);
    }
};

const toggleMenuCard = () => {
    showMenuCard.value = !showMenuCard.value;
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

/* Legend styles */
.legend {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px;
    font-size: 14px;
    line-height: 1.5;
}

.legend ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.legend li {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.legend span {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border-radius: 50%;
}
</style>
