<template>
  <div class="flex flex-col-reverse h-full md:flex-row md:h-full">
    <!-- Left: Table -->
    <div
      id="items-table-container"
      class="w-full h-[80%] md:h-full md:w-[70%] p-4 md:p-4 overflow-auto"
    >
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full">
        <div class="animate-spin">
          <svg
            class="w-8 h-8 text-primary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
        <p class="text-gray-700 mt-4">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else class="p-2 md:p-4">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">จำนวนศูนย์ทั้งหมด</p>
                <p class="text-2xl font-semibold">{{ items.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">เฉลี่ยเด็กต่ำกว่า 2 ขวบ</p>
                <p class="text-2xl font-semibold">{{ averageChildren.toFixed(1) }} คน</p>
              </div>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow"
          >
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-500 text-sm">เฉลี่ยพี่เลี้ยง</p>
                <p class="text-2xl font-semibold">
                  {{ averageBabysitters.toFixed(1) }} คน
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-lg md:text-xl font-bold">รายการศูนย์พัฒนาเด็กเล็ก</h1>
            <p class="text-sm text-gray-600">ที่ ส.ส. พรรคประชาชนบันทึก</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="downloadData('csv')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              CSV
            </button>
          </div>
        </div>

        <!-- Mobile Cards View -->
        <div class="block sm:hidden">
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="bg-white rounded-lg shadow mb-4 p-4"
          >
            <div class="grid grid-cols-2 gap-2">
              <div class="text-sm font-medium text-gray-500">ลำดับ:</div>
              <div>{{ index + 1 }}</div>
              <div class="text-sm font-medium text-gray-500">ชื่อ:</div>
              <div>{{ item.name }}</div>
              <div class="text-sm font-medium text-gray-500">จำนวนเด็กทั้งหมด:</div>
              <div>{{ item.extra_data?.total_children || "-" }} คน</div>
              <div class="text-sm font-medium text-gray-500">เด็กต่ำกว่า 2 ขวบ:</div>
              <div>{{ item.extra_data?.children_under_two || "-" }} คน</div>
              <div class="text-sm font-medium text-gray-500">จำนวนครูพี่เลี้ยง:</div>
              <div>{{ item.extra_data?.caretakers || "-" }} คน</div>
              <div class="text-sm font-medium text-gray-500">ครูจบป.ตรี:</div>
              <div>{{ item.extra_data?.caretakers_bachelor || "-" }} คน</div>
              <div class="text-sm font-medium text-gray-500">จำนวนห้อง:</div>
              <div>{{ item.extra_data?.rooms || "-" }} ห้อง</div>
              <div class="text-sm font-medium text-gray-500">ค่าบริการต่อเดือน:</div>
              <div>{{ item.extra_data?.fee_per_month || "-" }} บาท</div>
              <div class="text-sm font-medium text-gray-500">ประเภทสถานที่:</div>
              <div>{{ item.extra_data?.location_type || "-" }}</div>
              <div class="text-sm font-medium text-gray-500">วันที่สำรวจ:</div>
              <div>{{ item.extra_data?.survey_date || "-" }}</div>
              <div class="col-span-2 mt-2">
                <div class="text-sm font-medium text-gray-500 mb-1">
                  ความเห็นครูพี่เลี้ยง:
                </div>
                <div class="text-sm">
                  {{ item.extra_data?.caretaker_feedback || "-" }}
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-medium text-gray-500 mb-1">
                  ความเห็นผู้สำรวจ:
                </div>
                <div class="text-sm">{{ item.extra_data?.surveyor_feedback || "-" }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-medium text-gray-500 mb-1">
                  ความเห็นต่อสภาพอาคาร:
                </div>
                <div class="text-sm">{{ item.extra_data?.building_feedback || "-" }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-medium text-gray-500 mb-1">
                  ความเห็นเร่งด่วน:
                </div>
                <div class="text-sm">
                  {{ item.extra_data?.urgent_building_feedback || "-" }}
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-medium text-gray-500 mb-1">ความเปลี่ยนแปลง:</div>
                <div class="text-sm">
                  {{ item.extra_data?.building_changes_feedback || "-" }}
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-medium text-gray-500 mb-1">
                  ความเห็นต่อโรงเรียนอนุบาล:
                </div>
                <div class="text-sm">
                  {{ item.extra_data?.kindergarten_feedback || "-" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-sm text-white uppercase bg-secondary sticky top-0">
              <tr>
                <th class="px-3 py-3 text-center">#</th>
                <th class="px-3 py-3">ชื่อ</th>
                <th class="px-3 py-3 text-center">จำนวนเด็ก</th>
                <th class="px-3 py-3 text-center">เด็ก < 2 ขวบ</th>
                <th class="px-3 py-3 text-center">ครูพี่เลี้ยง</th>
                <th class="px-3 py-3 text-center">ครูจบป.ตรี</th>
                <th class="px-3 py-3 text-center">จำนวนห้อง</th>
                <th class="px-3 py-3 text-center">ค่าบริการ/ด.</th>
                <th class="px-3 py-3">ประเภทสถานที่</th>
                <th class="px-3 py-3">วันที่สำรวจ</th>
                <th class="px-3 py-3">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in items"
                :key="item.id"
                class="bg-white border-b hover:bg-gray-50"
              >
                <td class="px-3 py-3 text-center">{{ index + 1 }}</td>
                <td class="px-3 py-3">{{ item.name }}</td>
                <td class="px-3 py-3 text-center">
                  {{ item.extra_data?.total_children || "-" }}
                </td>
                <td class="px-3 py-3 text-center">
                  {{ item.extra_data?.children_under_two || "-" }}
                </td>
                <td class="px-3 py-3 text-center">
                  {{ item.extra_data?.caretakers || "-" }}
                </td>
                <td class="px-3 py-3 text-center">
                  {{ item.extra_data?.caretakers_bachelor || "-" }}
                </td>
                <td class="px-3 py-3 text-center">{{ item.extra_data?.rooms || "-" }}</td>
                <td class="px-3 py-3 text-center">
                  {{ item.extra_data?.fee_per_month || "-" }}
                </td>
                <td class="px-3 py-3">{{ item.extra_data?.location_type || "-" }}</td>
                <td class="px-3 py-3">{{ item.extra_data?.survey_date || "-" }}</td>
                <td class="px-3 py-3">
                  <button
                    @click="openDetailModal(item)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    ดูเพิ่มเติม
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Image Modal -->
        <div
          v-if="selectedImage"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="relative max-w-4xl max-h-[90vh]">
            <img :src="selectedImage" class="max-h-[90vh] object-contain" />
            <button
              @click="selectedImage = null"
              class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Detail Modal -->
        <ModalDetail v-if="showDetailModal" @close="showDetailModal = false">
          <template #title>รายละเอียดเพิ่มเติม</template>
          <template #body>
            <div class="space-y-4">
              <div>
                <h3 class="font-medium text-gray-700">ความเห็นครูพี่เลี้ยง:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.caretaker_feedback || "-" }}
                </p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">ความเห็นผู้สำรวจ:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.surveyor_feedback || "-" }}
                </p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">ความเห็นต่อสภาพอาคาร:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.building_feedback || "-" }}
                </p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">ความเห็นเร่งด่วน:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.urgent_building_feedback || "-" }}
                </p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">ความเปลี่ยนแปลง:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.building_changes_feedback || "-" }}
                </p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">ความเห็นต่อโรงเรียนอนุบาล:</h3>
                <p class="mt-1">
                  {{ selectedItem?.extra_data?.kindergarten_feedback || "-" }}
                </p>
              </div>
            </div>
          </template>
        </ModalDetail>
      </div>
    </div>

    <!-- Right: Map -->
    <div id="map-container" class="w-full h-[200px] md:w-[30%] md:h-full">
      <MapLibre
        :mapStyle="mapStyle"
        :center="[100.523186, 13.736717]"
        :zoom="11"
        :features="geoJsonFeatures"
        @click="handleMarkerClick"
        ref="mapRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import { useToast } from "vue-toastification";
import MapLibre from "@/components/MapLibre.vue";
import * as Terraformer from "@terraformer/wkt";
import ModalDetail from "@/components/shared/ModalDetail.vue";

const items = ref([]);
const isLoading = ref(true);
const selectedImage = ref(null);
const toast = useToast();
const selectedItem = ref(null);
const mapRef = ref(null);
const showDetailModal = ref(false);

// Computed properties for statistics
const averageChildren = computed(() => {
  const validItems = items.value.filter((item) => item.extra_data?.numberofchildren);
  if (!validItems.length) return 0;
  const total = validItems.reduce(
    (sum, item) => sum + Number(item.extra_data.numberofchildren),
    0
  );
  return total / validItems.length;
});

const averageBabysitters = computed(() => {
  const validItems = items.value.filter((item) => item.extra_data?.babysitter);
  if (!validItems.length) return 0;
  const total = validItems.reduce(
    (sum, item) => sum + Number(item.extra_data.babysitter),
    0
  );
  return total / validItems.length;
});

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl;
};

const downloadData = (format) => {
  try {
    // สร้างข้อมูลสำหรับ export
    const exportData = items.value.map((item, index) => ({
      ลำดับ: index + 1,
      ชื่อ: item.name,
      รายละเอียด: item.detail,
      จำนวนเด็ก: item.extra_data?.numberofchildren || "-",
      จำนวนพี่เลี้ยง: item.extra_data?.babysitter || "-",
      สถานะพี่เลี้ยง: item.extra_data?.babysitter_status || "-",
      ขนาดห้อง: item.extra_data?.roomsize || "-",
    }));

    // แปลงเป็น CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","), // header row
      ...exportData.map((row) =>
        headers
          .map(
            (header) =>
              // Escape quotes and commas in values
              `"${String(row[header]).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    // สร้าง Blob และดาวน์โหลด
    const blob = new Blob(["\ufeff" + csvContent], {
      // Add BOM for Excel Thai support
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ศูนย์พัฒนาเด็กเล็ก_${new Date().toLocaleDateString("th")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("ดาวน์โหลดข้อมูลสำเร็จ");
  } catch (error) {
    console.error("Error downloading data:", error);
    toast.error("เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล");
  }
};

const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// แปลงข้อมูลเป็น GeoJSON สำหรับแสดงบนแผนที่
const geoJsonFeatures = computed(() =>
  items.value
    .map((item) => {
      try {
        const geojson = Terraformer.wktToGeoJSON(item.geom);
        return {
          type: "Feature",
          geometry: geojson,
          properties: {
            id: item.id,
            name: item.name,
            detail: item.detail,
            extra_data: item.extra_data,
          },
        };
      } catch (error) {
        console.error(`Invalid WKT for item ${item.id}`, error);
        return null;
      }
    })
    .filter((feature) => feature !== null)
);

const handleMarkerClick = (e) => {
  if (e.features?.length > 0) {
    const feature = e.features[0];
    selectedItem.value = {
      id: feature.properties.id,
      name: feature.properties.name,
      detail: feature.properties.detail,
      extra_data: feature.properties.extra_data,
    };
  }
};

// เพิ่มฟังก์ชันสำหรับ focus ที่ marker เมื่อคลิกที่ตาราง
const focusOnGeometry = (wkt) => {
  const geojson = Terraformer.wktToGeoJSON(wkt);
  const bbox = calculateBoundingBox(geojson);
  if (bbox) {
    mapRef.value?.fitBoundingBox(bbox);
  }
};

const calculateBoundingBox = (geometry) => {
  if (geometry.type === "Point") {
    const [lon, lat] = geometry.coordinates;
    return [
      [lon - 0.001, lat - 0.001], // ขยายขอบเขตเล็กน้อยเพื่อให้มองเห็นจุดชัดเจน
      [lon + 0.001, lat + 0.001],
    ];
  }
  return null;
};

const openDetailModal = (item) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};

onMounted(async () => {
  try {
    const { getUrbanIssues } = useUrbanIssues();
    const response = await getUrbanIssues({ all: "true", province_id: 10 });
    items.value = response.data.filter((item) => item.sub_id === 404);
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("ไม่สามารถดึงข้อมูลได้ โปรดลองใหม่อีกครั้ง");
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.table-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
