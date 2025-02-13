<template>
  <div class="flex flex-col-reverse h-full md:flex-row md:h-full">
    <!-- Left: Table -->
    <div
      id="items-table-container"
      class="w-full h-[80%] md:h-full pr-0 md:w-[70%] p-4 md:p-4"
    >
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-xl font-bold">รายการ</h1>
        <div class="flex">
          <button
            :class="[
              'px-4 py-2 border-l border-t rounded-l-lg',
              showMine ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700',
            ]"
            @click="toggleView(true)"
          >
            ของฉัน
          </button>
          <button
            :class="[
              'px-4 py-2 border-l border-t rounded-r-lg',
              !showMine ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700',
            ]"
            @click="toggleView(false)"
          >
            ทุกคน
          </button>
        </div>
      </div>

      <div
        :class="[
          'relative overflow-y-auto shadow-md sm:rounded-lg',
          filteredItems.length !== 0 ? 'h-[60%] sm:h-[80%]' : 'h-[60%] sm:h-[10%]',
        ]"
      >
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead
            class="text-sm text-white uppercase bg-secondary dark:bg-gray-700 dark:text-gray-400 sticky top-0"
          >
            <tr>
              <th scope="col" class="px-3 py-3 w-2 text-center">#</th>
              <th scope="col" class="px-3 py-3 w-6 text-center">ชื่อ</th>
              <th scope="col" class="px-3 py-3 w-48 text-center">รายละเอียด</th>
              <th scope="col" class="px-3 py-3 w-16 text-center">รูปภาพ</th>
              <th scope="col" class="px-3 py-3 w-20 text-center">ประเภท</th>
              <!-- <th scope="col" class="px-3 py-3 w-20 text-center">วันที่สร้าง</th> -->
              <th v-if="showMine" scope="col" class="px-3 py-3 w-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="cursor-pointer bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-black dark:text-gray-400"
              @click="focusOnGeometry(item.geom)"
            >
              <td class="px-3 py-3 text-center font-light">
                {{ index + 1 + (page - 1) * limit }}
              </td>
              <td class="px-3 py-3 font-medium">{{ item.name }}</td>
              <td class="px-3 py-3 font-light" :title="item.detail">{{ item.detail }}</td>
              <td class="px-3 py-3 font-light">
                <div
                  v-if="item.images && item.images.length > 0"
                  class="cursor-pointer"
                  @click.stop="openImageModal(item.images)"
                >
                  <template
                    v-if="!item.images[0].match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)"
                  >
                    <img
                      :src="item.images[0]"
                      alt="image"
                      class="w-10 h-10 object-cover"
                    />
                  </template>
                  <template v-else>
                    <div class="text-primary text-sm underline">ดูวิดีโอแนบ</div>
                  </template>
                  <span v-if="item.images.length > 1" class="text-xs text-gray-500"
                    >+{{ item.images.length - 1 }}</span
                  >
                </div>
                <div v-else class="text-gray-400 text-xs">ไม่มีข้อมูล</div>
              </td>
              <td class="px-3 py-3 font-light" :title="item.sub_name">
                <img
                  :src="'/images/icons/' + item.sub_id + '.png'"
                  alt="icon"
                  class="inline-block w-6 h-6 mr-1"
                />
                {{ item.sub_name }}
              </td>
              <!-- <td class="px-3 py-3 text-start font-light">
                  <div>{{ formatDate(item.created).formattedDate }}</div>
                  <div>{{ formatDate(item.created).formattedTime }}</div>
                </td> -->
              <td v-if="showMine" class="px-3 py-3 text-center">
                <a
                  href="#"
                  class="text-blue-600 dark:text-blue-500 hover:underline ml-2"
                  @click.prevent="openEditModal(item)"
                >
                  <PencilIcon class="w-5 h-5 inline" />
                </a>
                <a
                  href="#"
                  class="text-red-600 dark:text-red-500 hover:underline ml-2"
                  @click.prevent="openDeleteModal(item.id)"
                >
                  <TrashIcon class="w-5 h-5 inline" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-red-700 my-4" v-show="filteredItems.length === 0">
        ยังไม่มีข้อมูลของคุณ กรุณาไปที่เมนู "บันทึก"
      </div>

      <div class="flex justify-between items-center mt-4">
        <button
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          :disabled="page === 1"
          @click="fetchData(page - 1)"
        >
          &lt; Previous
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          :disabled="!hasMore"
          @click="fetchData(page + 1)"
        >
          Next &gt;
        </button>
      </div>
    </div>

    <div id="map-container" class="w-full h-[200px] md:w-[30%] md:h-full">
      <MapLibre
        :mapStyle="mapStyle"
        :center="provinceLocation"
        :zoom="10"
        :features="geoJsonFeatures"
        @fitBoundingBox="fitBoundingBoxOnMap"
        ref="mapRef"
      />
    </div>

    <!-- Edit Modal for Confirm -->
    <Modal
      v-if="modalOpen"
      :isOpen="modalOpen"
      title="ยืนยันการลบข้อมูล"
      message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?"
      @cancel="closeModal"
      @confirm="confirmDelete"
    />

    <!-- Edit Modal -->
    <EditModal
      v-if="editModalOpen"
      :isOpen="editModalOpen"
      :title="'แก้ไขข้อมูล'"
      :initialData="editForm"
      :userEmail="userEmail"
      @cancel="closeEditModal"
      @updated="fetchData(page)"
    />

    <!-- Image/Video Modal -->
    <div
      v-if="imageModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl w-full mx-4" @click.stop>
        <button
          @click="closeImageModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div class="relative">
          <!-- รูปภาพ -->
          <img
            v-if="!isVideo(selectedImages[currentImageIndex])"
            :src="selectedImages[currentImageIndex]"
            class="mx-auto max-h-[80vh] object-contain"
            alt="Preview"
          />
          <!-- วิดีโอ -->
          <video
            v-else
            :src="selectedImages[currentImageIndex]"
            class="mx-auto max-h-[80vh]"
            controls
            autoplay
          ></video>

          <button
            v-if="selectedImages.length > 1"
            @click.stop="prevImage"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
          >
            &lt;
          </button>
          <button
            v-if="selectedImages.length > 1"
            @click.stop="nextImage"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
          >
            &gt;
          </button>
        </div>
        <div v-if="selectedImages.length > 1" class="text-center text-white mt-4">
          {{ currentImageIndex + 1 }} / {{ selectedImages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "Items",
});
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/useStore";
import { ref, computed, onMounted, nextTick } from "vue";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/solid";
import Modal from "@/components/shared/Modal.vue";
import EditModal from "@/components/shared/EditModal.vue";
import { useToast } from "vue-toastification";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import * as Terraformer from "@terraformer/wkt";
import { useProvinces } from "@/composables/useProvinces";
import { useProvinceLocation } from "@/composables/useProvinceLocation";

const route = useRoute();
const province = ref(route.params.province);

const { getProvinceId } = useProvinces();
const { getProvinceLocation } = useProvinceLocation();

const userStore = useUserStore();
const user = userStore.$state;

// State
const mapRef = ref(null); // Reference for MapLibre
const modalOpen = ref(false);
const itemIdToDelete = ref(null);
const items = ref([]);
const showMine = ref(true);
const page = ref(1);
const limit = ref(10);
const totalPages = ref(0);
const hasMore = ref(false);
const mapStyle = ref("https://basemaps.cartocdn.com/gl/positron-gl-style/style.json");
const userEmail = user.email;

// Image Modal State
const imageModalOpen = ref(false);
const selectedImages = ref([]);
const currentImageIndex = ref(0);

const editModalOpen = ref(false);
const editForm = reactive({
  id: null,
  name: "",
  detail: "",
  subcategory_id: null,
  geom: null,
  ownership_id: null,
  stakeholder_id: null,
  images: [],
  extra_data: null,
});

const provinceLocation = computed(() => {
  const location = getProvinceLocation(route.params.province);
  console.log(location);
  return [location.center[0], location.center[1]];
});

// Utilities and Methods
const toast = useToast();
const { getUrbanIssues, deleteUrbanIssue, updateUrbanIssue } = useUrbanIssues();
const emit = defineEmits(["fitBoundingBox"]); // Define the event

const filteredItems = computed(() => items.value);

// Image Modal Methods
function openImageModal(images) {
  selectedImages.value = images;
  currentImageIndex.value = 0;
  imageModalOpen.value = true;
}

function closeImageModal() {
  imageModalOpen.value = false;
  selectedImages.value = [];
  currentImageIndex.value = 0;
}

function nextImage() {
  if (currentImageIndex.value < selectedImages.value.length - 1) {
    currentImageIndex.value++;
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

const geoJsonFeatures = computed(() =>
  filteredItems.value
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
          },
        };
      } catch (error) {
        console.error(`Invalid WKT for item ${item.id}`, error);
        return null;
      }
    })
    .filter((feature) => feature !== null)
);

function openDeleteModal(id) {
  itemIdToDelete.value = id;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  itemIdToDelete.value = null;
}

// Open Edit Modal
function openEditModal(item) {
  console.log(item);
  editForm.id = item.id;
  editForm.name = item.name;
  editForm.detail = item.detail;
  editForm.subcategory_id = parseInt(item.sub_id);
  editForm.images = item.images;
  editForm.geom = item.geom;
  editForm.ownership_id = item.ownership_id;
  editForm.stakeholder_id = item.stakeholder_id;
  editForm.extra_data = item.extra_data;
  editModalOpen.value = true;
}

// Close Edit Modal
function closeEditModal() {
  editModalOpen.value = false;
  editForm.id = null;
  editForm.name = "";
  editForm.detail = "";
  editForm.subcategory_id = null;
  editForm.geom = null;
  editForm.ownership_id = null;
  editForm.stakeholder_id = null;
  editForm.images = [];
  editForm.extra_data = null;
}

async function confirmDelete() {
  try {
    await deleteItem(itemIdToDelete.value);
  } catch (error) {
    toast.error("เกิดข้อผิดพลาด: " + error.message);
  } finally {
    closeModal();
  }
}

async function deleteItem(id) {
  try {
    await deleteUrbanIssue(id, userEmail); // Pass ID and email
    toast.success("ลบข้อมูลสำเร็จ");
    fetchData(page.value); // Refresh data after deletion
  } catch (error) {
    toast.error("เกิดข้อผิดพลาด: " + error.message);
  }
}

async function fetchData(currentPage = 1) {
  try {
    const params = {
      page: currentPage,
      province_id: getProvinceId(province.value),
      ...(showMine.value && { email: userEmail }),
    };
    const data = await getUrbanIssues(params);
    items.value = data.data;
    page.value = data.page;
    totalPages.value = data.totalPages;
    hasMore.value = data.hasMore;
  } catch {
    toast.error("ไม่สามารถดึงข้อมูลได้ โปรดลองใหม่อีกครั้ง");
  }
}

function toggleView(isMine) {
  showMine.value = isMine;
  fetchData(1);
}

function formatDate(date) {
  const optionsDate = { year: "numeric", month: "short", day: "numeric" };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = new Date(date).toLocaleDateString("th-TH", optionsDate);
  const formattedTime = new Date(date).toLocaleTimeString("th-TH", optionsTime) + " น.";

  return { formattedDate, formattedTime };
}

function focusOnGeometry(wkt) {
  const geojson = Terraformer.wktToGeoJSON(wkt);
  const bbox = calculateBoundingBox(geojson);

  if (bbox) {
    fitBoundingBoxOnMap(bbox);
  }
}

function calculateBoundingBox(geometry) {
  if (geometry.type === "Point") {
    return [
      [geometry.coordinates[0], geometry.coordinates[1]],
      [geometry.coordinates[0], geometry.coordinates[1]],
    ];
  } else if (geometry.type === "Polygon" || geometry.type === "LineString") {
    const coords =
      geometry.type === "Polygon" ? geometry.coordinates.flat(1) : geometry.coordinates;
    const lons = coords.map(([lon]) => lon);
    const lats = coords.map(([, lat]) => lat);
    return [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];
  }
  return null;
}

// Fit Bounding Box on Map
function fitBoundingBoxOnMap(bbox) {
  nextTick(() => {
    if (mapRef.value) {
      mapRef.value.fitBoundingBox(bbox);
    } else {
      console.error("mapRef.value is null");
    }
  });
}

// Lifecycle Hook
onMounted(() => {
  fetchData(1);
});

// เพิ่มฟังก์ชันตรวจสอบประเภทไฟล์
const isVideo = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i);
};
</script>
