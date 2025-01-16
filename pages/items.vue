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

      <div class="relative h-[60%] md:h-[80%] overflow-y-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead
            class="text-sm text-white uppercase bg-secondary dark:bg-gray-700 dark:text-gray-400 sticky top-0"
          >
            <tr>
              <th scope="col" class="px-3 py-3 w-2 text-center">#</th>
              <th scope="col" class="px-3 py-3 w-6 text-center">ชื่อ</th>
              <th scope="col" class="px-3 py-3 w-48 text-center">รายละเอียด</th>
              <th scope="col" class="px-3 py-3 w-20 text-center">ประเภท</th>
              <th scope="col" class="px-3 py-3 w-20 text-center">วันที่สร้าง</th>
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
              <td class="px-3 py-3 font-light" :title="item.sub_name">
                <img
                  :src="'/images/icons/' + item.sub_id + '.png'"
                  alt="icon"
                  class="inline-block w-6 h-6 mr-1"
                />
                {{ item.sub_name }}
              </td>
              <td class="px-3 py-3 text-start font-light">
                <div>{{ formatDate(item.created).formattedDate }}</div>
                <div>{{ formatDate(item.created).formattedTime }}</div>
              </td>
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

      <div class="flex justify-between items-center mt-4">
        <button
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          :disabled="page === 1"
          @click="fetchData(page - 1)"
        >
          < Previous
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          :disabled="!hasMore"
          @click="fetchData(page + 1)"
        >
          Next >
        </button>
      </div>
    </div>

    <div id="map-container" class="w-full h-[200px] md:w-[30%] md:h-full">
      <MapLibre
        :mapStyle="mapStyle"
        :center="[100.523186, 13.736717]"
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
      :detail="editForm.detail"
      :name="editForm.name"
      :subCategory="editForm.subcategory_id"
      title="แก้ไขข้อมูล"
      @cancel="closeEditModal"
      @confirm="submitEditForm"
    >
      <div class="p-4">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">ชื่อ</label>
          <input
            id="name"
            type="text"
            v-model="editForm.name"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="mb-4">
          <label for="detail" class="block text-sm font-medium text-gray-700"
            >รายละเอียด</label
          >
          <textarea
            id="detail"
            v-model="editForm.detail"
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        <div>
          <Dropdowns
            :resetTrigger="resetDropdown"
            :initialCategoryId="Number(String(editForm.subcategory_id).charAt(0))"
            :initialSubcategoryId="editForm.subcategory_id"
            @subcategory-changed="handleSelectionChanged"
          />
          <p
            v-if="isSubmitted && (!selectedCategory || !editForm.subcategory_id)"
            class="text-red-500 text-sm"
          >
            กรุณาเลือกหมวดหมู่และหมวดหมู่ย่อย
          </p>
        </div>
      </div>
    </EditModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/solid";
import Modal from "@/components/Modal.vue";
import EditModal from "@/components/editModal.vue";
import { useToast } from "vue-toastification";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import * as Terraformer from "@terraformer/wkt";

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
const userEmail = "admin@gmail.com";
const resetDropdown = ref(false);
const isSubmitted = ref(false);

const editModalOpen = ref(false);
const editForm = reactive({
  id: null,
  name: "",
  detail: "",
  subcategory_id: null
});

// Utilities and Methods
const toast = useToast();
const { getUrbanIssues, deleteUrbanIssue, updateUrbanIssue } = useUrbanIssues();
const emit = defineEmits(["fitBoundingBox"]); // Define the event

const filteredItems = computed(() => items.value);

const handleSelectionChanged = (selectedSubCategory) => {
  editForm.subcategory_id = selectedSubCategory.selectedCategoryId
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
  editForm.id = item.id;
  editForm.name = item.name;
  editForm.detail = item.detail;
  editForm.subcategory_id = item.sub_id;
  // editForm.ownership_id = item.ownership_id;
  editModalOpen.value = true;
}

// Close Edit Modal
function closeEditModal() {
  editModalOpen.value = false;
  editForm.id = null;
  editForm.name = "";
  editForm.detail = "";
  editForm.subcategory_id = null;
  // editForm.ownership_id = null;
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

// Submit Edit Form
async function submitEditForm() {
  try {
    const payload = {
      name: editForm.name,
      detail: editForm.detail,
      subcategory_id: editForm.subcategory_id,
      email: userEmail,
      // geom: null
      // images: [],
    };
    await updateUrbanIssue(editForm.id, payload);
    toast.success("แก้ไขข้อมูลสำเร็จ");
    closeEditModal();
    fetchData(page.value); // Refresh data after editing
  } catch (error) {
    toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถแก้ไขข้อมูลได้"));
  }
}

async function fetchData(currentPage = 1) {
  try {
    const params = {
      page: currentPage,
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
</script>
