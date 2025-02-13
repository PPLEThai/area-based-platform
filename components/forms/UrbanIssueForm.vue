<template>
  <div class="flex flex-col-reverse h-fit md:flex-row md:h-full">
    <!-- ส่วนของการบันทึกข้อมูล -->
    <div class="w-5/5 md:w-2/5 p-4 shadow-lg h-auto md:h-full overflow-y-auto">
      <div class="py-2">
        <div class="text-primary font-bold">
          บันทึกข้อมูลปัญหาพื้นที่หรือแนวทางการแก้ไข
        </div>
        <div class="text-gray-500 font-light text-sm">
          สามารถลากเลื่อนแผนที่ไปยังพิกัดที่ต้องการได้
        </div>
      </div>
      <hr class="my-2 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

      <form @submit.prevent="openConfirmModal">
        <div class="grid gap-6 mb-6 grid-cols-1 md:grid-cols-1">
          <!-- หัวข้อ -->
          <div>
            <label
              for="title-name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              หัวข้อ<span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title-name"
              v-model="titleName"
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="เช่น ปรับปรุงพื้นที่รกร้าง"
            />
            <p v-if="isSubmitted && !titleName.trim()" class="text-red-500 text-sm">
              กรุณากรอกหัวข้อ
            </p>
          </div>

          <!-- หมวดหมู่และหมวดหมู่ย่อย -->
          <div>
            <Dropdowns
              :resetTrigger="resetDropdown"
              @selection-changed="handleSelectionChanged"
            />
            <p
              v-if="isSubmitted && (!selectedCategory || !selectedSubcategory)"
              class="text-red-500 text-sm"
            >
              กรุณาเลือกหมวดหมู่และหมวดหมู่ย่อย
            </p>
          </div>

          <SubcategoryFields
            class="mb-4"
            v-if="hasExtraFields"
            :subcategoryId="selectedSubcategory"
            v-model="extraData"
            :showValidation="isSubmitted"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700"
                >การถือครอง<span class="text-red-500">*</span></label
              >
              <select
                id="category"
                v-model="selectedOwnership"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="null" disabled>เลือกการถือครอง</option>
                <option v-for="owner in ownershipList" :key="owner.id" :value="owner.id">
                  {{ owner.name }}
                </option>
              </select>
              <p v-if="isSubmitted && !selectedOwnership" class="text-red-500 text-sm">
                กรุณาเลือกการถือครอง
              </p>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700"
                >ผู้มีส่วนได้ส่วนเสีย<span class="text-red-500">*</span></label
              >
              <select
                id="category"
                v-model="selectedStakeholder"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="null" disabled>เลือกผู้มีส่วนได้ส่วนเสีย</option>
                <option
                  v-for="stackholder in stakeholderList"
                  :key="stackholder.id"
                  :value="stackholder.id"
                >
                  {{ stackholder.name }}
                </option>
              </select>
              <p v-if="isSubmitted && !selectedStakeholder" class="text-red-500 text-sm">
                กรุณาเลือกผู้มีส่วนได้ส่วนเสีย
              </p>
            </div>
          </div>

          <div>
            <label
              for="detail-name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              รายละเอียด<span class="text-red-500">*</span>
            </label>
            <textarea
              id="detail-name"
              rows="4"
              v-model="detailName"
              class="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="ใส่รายละเอียดที่นี่"
            ></textarea>
            <p v-if="isSubmitted && !detailName.trim()" class="text-red-500 text-sm">
              กรุณากรอกรายละเอียด
            </p>
          </div>
        </div>

        <!-- Upload media -->
        <div class="grid gap-2 mb-2 md:grid-cols-1">
          <label
            class="block text-sm font-medium text-gray-900 dark:text-white"
            for="multiple_files"
            >อัปโหลดรูปภาพหรือวิดีโอประกอบ (ไม่เกิน 5 ไฟล์)</label
          >
          <input
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="multiple_files"
            type="file"
            multiple
            accept="image/*,video/*"
            @change="handleFileUpload"
          />
          <p class="text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
            รูปภาพ: PNG, JPG (ขนาดไม่เกิน 800x400px และ 5MB) และวิดีโอ: MP4, WebM
            (ขนาดไม่เกิน 30MB)
          </p>

          <!-- แสดงตัวอย่างรูปภาพและวิดีโอ -->
          <div v-if="filePreviews.length" class="my-4 grid grid-cols-3 gap-2">
            <div v-for="(preview, index) in filePreviews" :key="index" class="relative">
              <img
                v-if="preview.type === 'image'"
                :src="preview.url"
                alt="Preview"
                class="w-full h-auto rounded-lg"
              />
              <video
                v-else-if="preview.type === 'video'"
                :src="preview.url"
                class="w-full h-auto rounded-lg"
                controls
              ></video>
              <button
                type="button"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                @click="removeFile(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Submit
        </button>
      </form>
    </div>

    <!-- ส่วนของแผนที่ -->
    <div class="w-5/5 md:w-3/5 h-[350px] md:h-full relative">
      <button
        @click="getCurrentLocation"
        :disabled="isGettingLocation"
        class="flex items-center absolute bottom-10 left-4 z-10 bg-primary p-2 rounded-lg shadow-md hover:bg-primary"
      >
        <!-- marker icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        <p class="ml-2 text-sm font-bold text-white">
          {{ isGettingLocation ? "กำลังระบุตำแหน่ง..." : "ตำแหน่งของท่าน" }}
        </p>
      </button>

      <!-- Progress bar -->
      <div
        v-if="isGettingLocation"
        class="absolute bottom-24 left-4 z-10 w-64 bg-white p-4 rounded-lg shadow-md"
      >
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-primary h-2.5 rounded-full animate-pulse"
            style="width: 100%"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">กำลังค้นหาตำแหน่งของคุณ...</p>
      </div>

      <MapLibreTerraDraw
        :mapStyle="mapStyle"
        :center="location.center"
        :zoom="location.zoom"
        :province="props.province"
        :provinceId="provinceId"
        @features-updated="updateFeatures"
        @mapLoaded="onMapLoaded"
      />
    </div>
    <Modal
      :isOpen="isModalOpen"
      title="ยืนยันการส่งข้อมูล"
      message="คุณแน่ใจหรือไม่ว่าต้องการส่งข้อมูลนี้?"
      @cancel="cancelSubmit"
      @confirm="confirmSubmit"
    />
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/useStore";
import { useRouter } from "#app";
import { ref, onMounted, computed, watch } from "vue";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import { useToast } from "vue-toastification";
import { geojsonToWKT } from "@terraformer/wkt";
import Dropdowns from "@/components/shared/Dropdowns.vue";
import MapLibreTerraDraw from "~/components/maps/MapLibreTerraDraw.vue";
import Modal from "@/components/shared/Modal.vue";
import maplibregl from "maplibre-gl";
import { useProvinceLocation } from "@/composables/useProvinceLocation";
import { useProvinces } from "@/composables/useProvinces";
import { useUrbanOptions } from "@/composables/useUrbanOptions";
import SubcategoryFields from "@/components/shared/SubcategoryFields.vue";
import { useSubcategoryFields } from "@/composables/useSubcategoryFields";

const userStore = useUserStore();
const user = userStore.$state;

const uploadedFiles = ref([]); // Initialize as empty array
const filePreviews = ref([]);
const resetDropdown = ref(false);
const isModalOpen = ref(false);
const isSubmitted = ref(false);
const titleName = ref("");
const detailName = ref("");
const selectedCategory = ref(null);
const selectedSubcategory = ref(null);
const selectedOwnership = ref(null);
const selectedStakeholder = ref(null);
const geom = ref([]);
const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"; // free
const mapInstance = ref(null);
const isGettingLocation = ref(false);
const currentMarker = ref(null);

const { subcategoryFields, getDefaultValues, validateFields } = useSubcategoryFields();

const extraData = ref(getDefaultValues(selectedSubcategory.value));

// เพิ่ม computed property เพื่อเช็คว่ามี extra fields หรือไม่
const hasExtraFields = computed(() => {
  return selectedSubcategory.value && subcategoryFields[selectedSubcategory.value];
});

// เพิ่ม watch เพื่อรีเซ็ต extraData เมื่อเปลี่ยน subcategory
watch(
  () => selectedSubcategory.value,
  (newSubcategoryId) => {
    if (newSubcategoryId) {
      // รีเซ็ตค่าใหม่ทั้งหมดตาม subcategory
      extraData.value = getDefaultValues(newSubcategoryId);
    } else {
      // ถ้าไม่ได้เลือก subcategory ให้เคลียร์ค่า
      extraData.value = {};
    }
  },
  { immediate: true }
);

const props = defineProps({
  province: {
    type: String,
    required: true,
  },
});

const { getProvinceLocation } = useProvinceLocation();
const location = computed(() => getProvinceLocation(props.province));

const { getProvinceId } = useProvinces();
const provinceId = computed(() => getProvinceId(props.province));

const { ownershipList, stakeholderList } = useUrbanOptions();

const onMapLoaded = async (map) => {
  mapInstance.value = map; // Store the MapLibre instance
};

onMounted(() => {});

const updateGeomFromMarker = (lngLat) => {
  const point = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lngLat.lng, lngLat.lat],
    },
    properties: {},
  };
  geom.value = [point];
};

// ฟังก์ชันสำหรับดึงตำแหน่งปัจจุบัน
const getCurrentLocation = () => {
  const toast = useToast();
  isGettingLocation.value = true;

  if (!navigator.geolocation) {
    toast.error("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
    isGettingLocation.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // ดึงพิกัดปัจจุบัน
      const { latitude, longitude } = position.coords;

      // เลื่อนแผนที่ไปยังตำแหน่งปัจจุบัน
      if (mapInstance.value) {
        // ลบ marker เดิมถ้ามีอยู่
        if (currentMarker.value) {
          currentMarker.value.remove();
        }

        mapInstance.value.flyTo({
          center: [longitude, latitude],
          zoom: 15,
        });

        // สร้าง marker แสดงตำแหน่งปัจจุบันที่สามารถลากได้
        currentMarker.value = new maplibregl.Marker({
          draggable: true,
        })
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setHTML("คุณสามารถลากหมุดเพื่อปรับตำแหน่งได้"))
          .addTo(mapInstance.value);

        // เพิ่ม event listener สำหรับการลากหมุด
        currentMarker.value.on("dragend", () => {
          const lngLat = currentMarker.value.getLngLat();
          updateGeomFromMarker(lngLat);
        });

        // อัพเดทค่า geom เริ่มต้น
        updateGeomFromMarker({ lng: longitude, lat: latitude });

        toast.success("ระบุตำแหน่งปัจจุบันสำเร็จ สามารถลากหมุดเพื่อปรับตำแหน่งได้");
        isGettingLocation.value = false;
      }
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("กรุณาอนุญาตการเข้าถึงตำแหน่งของคุณ");
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("ไม่สามารถระบุตำแหน่งของคุณได้");
          break;
        case error.TIMEOUT:
          toast.error("หมดเวลาในการระบุตำแหน่ง");
          break;
        default:
          toast.error("เกิดข้อผิดพลาดในการระบุตำแหน่ง");
      }
      isGettingLocation.value = false;
    }
  );
};

const handleSelectionChanged = (selectedDropdown) => {
  selectedCategory.value = selectedDropdown.selectedCategoryId;
  selectedSubcategory.value = selectedDropdown.selectedSubcategoryId;
};

const openConfirmModal = () => {
  isSubmitted.value = true;
  const toast = useToast();

  // ตรวจสอบฟิลด์พื้นฐาน
  if (
    !titleName.value.trim() ||
    !selectedCategory.value ||
    !selectedSubcategory.value ||
    !detailName.value.trim() ||
    !selectedOwnership.value ||
    !selectedStakeholder.value
  ) {
    toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง", { timeout: 3000 });
    return;
  }

  // ตรวจสอบ extra fields ถ้ามี
  if (hasExtraFields.value) {
    const { isValid, errors } = validateFields(
      selectedSubcategory.value,
      extraData.value
    );
    if (!isValid) {
      toast.error("กรุณากรอกข้อมูลเพิ่มเติมให้ครบถ้วน", { timeout: 3000 });
      return;
    }
  }

  if (geom.value.length === 0) {
    toast.error("กรุณาปักหมุดหรือวาดขอบเขตบนแผนที่", { timeout: 3000 });
    return;
  }

  isModalOpen.value = true;
};

const cancelSubmit = () => {
  isModalOpen.value = false;
};

const confirmSubmit = async () => {
  const router = useRouter();
  isModalOpen.value = false;
  const toast = useToast();

  const formData = new FormData();
  formData.append("name", titleName.value);
  formData.append("subcategory_id", selectedSubcategory.value);
  formData.append("ownership_id", selectedOwnership.value);
  formData.append("creator_mail", user.email);
  formData.append("detail", detailName.value);
  formData.append("geom", geojsonToWKT(geom.value[0].geometry));
  formData.append("stakeholder_id", selectedStakeholder.value);
  formData.append("province_id", provinceId.value);

  // เพิ่ม extra_data ถ้ามี
  if (hasExtraFields.value) {
    formData.append("extra_data", JSON.stringify(extraData.value));
  }

  // เพิ่มรูปภาพ
  uploadedFiles.value.forEach((file) => {
    formData.append(`images`, file);
  });

  try {
    const { postUrbanIssue } = useUrbanIssues();
    await postUrbanIssue(formData);
    toast.success("ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว!");
    resetForm();
    router.push(`/${props.province}/items`);
  } catch (error) {
    console.error("Error Details:", error);
    toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
  }
};

const resetForm = () => {
  isSubmitted.value = false;
  titleName.value = "";
  selectedCategory.value = null;
  selectedSubcategory.value = null;
  selectedOwnership.value = null;
  selectedStakeholder.value = null;
  detailName.value = "";
  geom.value = [];
  resetDropdown.value = true;
  if (currentMarker.value) {
    currentMarker.value.remove();
    currentMarker.value = null;
  }
  nextTick(() => {
    resetDropdown.value = false;
  });
  extraData.value = getDefaultValues(selectedSubcategory.value);
};

const updateFeatures = (newFeatures) => {
  geom.value = newFeatures;
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  const toast = useToast();

  // จำกัดจำนวนไฟล์ที่อัปโหลดได้ (สูงสุด 5 ไฟล์)
  if (files.length + uploadedFiles.value.length > 5) {
    toast.error("คุณสามารถอัปโหลดได้สูงสุด 5 ไฟล์เท่านั้น");
    return;
  }

  for (const file of files) {
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพหรือวิดีโอ");
      continue;
    }

    // ตรวจสอบขนาดไฟล์วิดีโอ
    if (file.type.startsWith("video/") && file.size > 30 * 1024 * 1024) {
      // 50MB
      toast.error("ขนาดไฟล์วิดีโอต้องไม่เกิน 30MB");
      continue;
    }

    // เพิ่มไฟล์ลงใน uploadedFiles
    uploadedFiles.value.push(file);

    // สร้าง URL สำหรับแสดงตัวอย่าง
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreviews.value.push({
        type: file.type.startsWith("image/") ? "image" : "video",
        url: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  }
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1); // ลบไฟล์ออกจากอาร์เรย์
  filePreviews.value.splice(index, 1); // ลบรูปตัวอย่างออก
};
</script>
