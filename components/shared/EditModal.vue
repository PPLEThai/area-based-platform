<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full sm:max-w-[1000px] md:h-auto">
      <!-- Modal Header -->
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <button @click="$emit('cancel')" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 h-[70vh] overflow-y-auto">
        <div class="flex flex-col sm:flex-row">
          <!-- Map edit -->
          <div class="p-4 w-full sm:w-[50%]">
            <div class="h-full">
              <div class="h-[300px] w-full sm:h-full">
                <MapLibreEditModal
                  :mapStyle="mapStyle"
                  :center="[100.523186, 13.736717]"
                  @features-updated="updateFeatures"
                  :zoom="10"
                  ref="editMapRef"
                  :initialGeom="initialGeoJSON"
                />
              </div>
            </div>
          </div>

          <!-- Form edit -->
          <div class="p-4 w-full sm:w-[50%]">
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-700"
                >ชื่อ</label
              >
              <input
                id="name"
                type="text"
                v-model="form.name"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">ประเภท</label>
              <div class="mt-1 flex gap-4">
                <div class="flex items-center">
                  <input
                    type="radio"
                    id="problem"
                    name="type"
                    value="problem"
                    v-model="form.type"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label for="problem" class="ml-2 text-sm font-medium text-gray-900"
                    >ปัญหา</label
                  >
                </div>
                <div class="flex items-center">
                  <input
                    type="radio"
                    id="proposal"
                    name="type"
                    value="proposal"
                    v-model="form.type"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label for="proposal" class="ml-2 text-sm font-medium text-gray-900"
                    >ข้อเสนอโครงการ</label
                  >
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label for="detail" class="block text-sm font-medium text-gray-700"
                >รายละเอียด</label
              >
              <textarea
                id="detail"
                v-model="form.detail"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>

            <div class="mb-4">
              <Dropdowns
                :resetTrigger="resetDropdown"
                :initialCategoryId="getCategoryId"
                :initialSubcategoryId="form.subcategory_id"
                @selection-changed="handleSelectionChanged"
              />
            </div>

            <!-- Extra Fields สำหรับศูนย์พัฒนาเด็กเล็ก -->
            <div class="mb-4">
              <SubcategoryFields
                v-if="hasExtraFields"
                :subcategoryId="form.subcategory_id"
                v-model="extraData"
                :showValidation="formSubmitted"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="ownership" class="block text-sm font-medium text-gray-700"
                  >การถือครอง</label
                >
                <select
                  id="ownership"
                  v-model="form.ownership_id"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="null" disabled>เลือกการถือครอง</option>
                  <option
                    v-for="owner in ownershipList"
                    :key="owner.id"
                    :value="owner.id"
                  >
                    {{ owner.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="stakeholder" class="block text-sm font-medium text-gray-700"
                  >ผู้มีส่วนได้ส่วนเสีย</label
                >
                <select
                  id="stakeholder"
                  v-model="form.stakeholder_id"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="null" disabled>เลือกผู้มีส่วนได้ส่วนเสีย</option>
                  <option
                    v-for="stakeholder in stakeholderList"
                    :key="stakeholder.id"
                    :value="stakeholder.id"
                  >
                    {{ stakeholder.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Upload media -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >อัปโหลดรูปภาพหรือวิดีโอประกอบ (ไม่เกิน 5 ไฟล์)</label
              >
              <input
                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                type="file"
                multiple
                accept="image/*,video/*"
                @change="handleFileUpload"
              />
              <p class="mt-1 text-sm text-gray-500">
                รูปภาพ: PNG, JPG (ขนาดไม่เกิน 5MB) และวิดีโอ: MP4, WebM (ขนาดไม่เกิน 30MB)
              </p>

              <!-- แสดงรูปภาพและวิดีโอที่มีอยู่เดิม -->
              <div v-if="existingImages.length" class="grid grid-cols-2 gap-2 mt-2">
                <div
                  v-for="(media, index) in existingImages"
                  :key="index"
                  class="relative group"
                >
                  <!-- รูปภาพ -->
                  <img
                    v-if="!isVideo(media)"
                    :src="media"
                    class="w-full h-32 object-cover rounded"
                    :alt="`รูปภาพที่ ${index + 1}`"
                  />
                  <!-- วิดีโอ -->
                  <div
                    v-else
                    class="w-full h-32 bg-gray-100 rounded flex items-center justify-center"
                  >
                    <div class="text-primary text-sm underline">วิดีโอแนบ</div>
                  </div>
                  <button
                    @click="removeExistingImage(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="ลบไฟล์"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- แสดงรูปภาพและวิดีโอที่เพิ่งอัปโหลด -->
              <div v-if="filePreviews.length" class="grid grid-cols-2 gap-2 mt-2">
                <div
                  v-for="(preview, index) in filePreviews"
                  :key="index"
                  class="relative group"
                >
                  <!-- รูปภาพ -->
                  <img
                    v-if="!isVideo(uploadedFiles[index].name)"
                    :src="preview"
                    class="w-full h-32 object-cover rounded"
                    :alt="`ไฟล์ใหม่ที่ ${index + 1}`"
                  />
                  <!-- วิดีโอ -->
                  <div
                    v-else
                    class="w-full h-32 bg-gray-100 rounded flex items-center justify-center"
                  >
                    <div class="text-primary text-sm underline">วิดีโอใหม่</div>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="ลบไฟล์"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end px-4 py-3 border-t border-gray-300">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
        >
          ยกเลิก
        </button>
        <button
          @click="handleSubmit"
          :disabled="!isFormValid"
          class="px-4 py-2 rounded hover:bg-primary-dark"
          :class="[
            !isFormValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white',
          ]"
        >
          ยืนยัน
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import MapLibreEditModal from "../maps/MapLibreEditModal.vue";
import { useToast } from "vue-toastification";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import * as Terraformer from "@terraformer/wkt";
import Dropdowns from "@/components/shared/Dropdowns.vue";
import SubcategoryFields from "@/components/shared/SubcategoryFields.vue";
import { useUrbanOptions } from "@/composables/useUrbanOptions";
import { useSubcategoryFields } from "@/composables/useSubcategoryFields";

const props = defineProps({
  isOpen: Boolean,
  title: String,
  initialData: Object,
  userEmail: String,
});

const emit = defineEmits(["cancel", "confirm", "updated"]);
const toast = useToast();
const formSubmitted = ref(false);

const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const form = ref({
  id: props.initialData?.id || null,
  name: props.initialData?.name || "",
  detail: props.initialData?.detail || "",
  type: props.initialData?.type || null,
  subcategory_id: props.initialData?.subcategory_id || null,
  ownership_id: props.initialData?.ownership_id || null,
  stakeholder_id: props.initialData?.stakeholder_id || null,
  geom: props.initialData?.geom || null,
  images: props.initialData?.images || [],
  extra_data: props.initialData?.extra_data || null,
});

const { subcategoryFields, getDefaultValues } = useSubcategoryFields();

// เพิ่ม computed property เพื่อเช็คว่ามี extra fields หรือไม่
const hasExtraFields = computed(() => {
  return form.value.subcategory_id && subcategoryFields[form.value.subcategory_id];
});

// แก้ไข extraData ref เพื่อใช้ค่าจาก initialData.extra_data ถ้ามี
const extraData = ref(
  props.initialData?.extra_data
    ? (() => {
        // ถ้าเป็น string ให้แปลงเป็น object
        const extraDataObj =
          typeof props.initialData.extra_data === "string"
            ? JSON.parse(props.initialData.extra_data)
            : props.initialData.extra_data;

        return {
          total_children: parseInt(extraDataObj.total_children) || 0,
          children_under_two: parseInt(extraDataObj.children_under_two) || 0,
          caretakers: parseInt(extraDataObj.caretakers) || 0,
          caretakers_bachelor: parseInt(extraDataObj.caretakers_bachelor) || 0,
          rooms: parseInt(extraDataObj.rooms) || 0,
          fee_per_month: parseInt(extraDataObj.fee_per_month) || 0,
          location_type: extraDataObj.location_type || "",
          survey_date: extraDataObj.survey_date || "",
          caretaker_feedback: extraDataObj.caretaker_feedback || "",
          surveyor_feedback: extraDataObj.surveyor_feedback || "",
          building_feedback: extraDataObj.building_feedback || "",
          urgent_building_feedback: extraDataObj.urgent_building_feedback || "",
          building_changes_feedback: extraDataObj.building_changes_feedback || "",
          kindergarten_feedback: extraDataObj.kindergarten_feedback || "",
        };
      })()
    : getDefaultValues(form.value.subcategory_id)
);

// เพิ่ม watch เพื่อติดตามการเปลี่ยนแปลงของ subcategory_id
watch(
  () => form.value.subcategory_id,
  (newId) => {
    if (newId && !props.initialData?.extra_data) {
      extraData.value = getDefaultValues(newId);
    }
  }
);

const resetDropdown = ref(false);

const isFormValid = computed(() => {
  const basicValidation =
    form.value.name &&
    form.value.detail &&
    form.value.subcategory_id !== "" &&
    form.value.geom;

  return basicValidation;
});

const getCategoryId = computed(() => {
  if (!form.value.subcategory_id) return "";
  return parseInt(String(form.value.subcategory_id).charAt(0));
});

const handleSelectionChanged = (selection) => {
  form.value.subcategory_id = selection.selectedSubcategoryId;
};

const updateFeatures = (newFeatures) => {
  if (newFeatures && newFeatures.length > 0) {
    const wkt = Terraformer.geojsonToWKT(newFeatures[0].geometry);
    form.value.geom = wkt;
  }
};

const initialGeoJSON = computed(() => {
  if (!form.value.geom) return null;
  try {
    // Check if form.value.geom is already a GeoJSON object
    if (typeof form.value.geom === "object") {
      return {
        type: "Feature",
        geometry: form.value.geom,
        properties: {},
      };
    }
    // If it's a WKT string, convert it
    if (typeof form.value.geom === "string") {
      const geojson = Terraformer.wktToGeoJSON(form.value.geom);
      return {
        type: "Feature",
        geometry: geojson,
        properties: {},
      };
    }
    return null;
  } catch (error) {
    console.error("Error converting WKT to GeoJSON:", error);
    return null;
  }
});

// รูปภาพที่มีอยู่แล้ว
const existingImages = ref(
  props.initialData?.images?.filter((img) => img !== null) || []
);
// รูปภาพใหม่ที่จะอัพโหลด
const uploadedFiles = ref([]);
const filePreviews = ref([]);

const { ownershipList, stakeholderList } = useUrbanOptions();

// เพิ่มฟังก์ชันตรวจสอบประเภทไฟล์
const isVideo = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i);
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxVideoSize = 30 * 1024 * 1024; // 30MB

  if (files.length + uploadedFiles.value.length + existingImages.value.length > 5) {
    toast.error("คุณสามารถอัปโหลดได้สูงสุด 5 ไฟล์เท่านั้น");
    return;
  }

  for (const file of files) {
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพหรือวิดีโอ");
      continue;
    }

    // ตรวจสอบขนาดไฟล์
    const maxSize = file.type.startsWith("video/") ? maxVideoSize : maxImageSize;
    if (file.size > maxSize) {
      toast.error(
        `ไฟล์ ${file.name} มีขนาดใหญ่เกิน ${
          file.type.startsWith("video/") ? "30MB" : "5MB"
        }`
      );
      continue;
    }

    uploadedFiles.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreviews.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
  filePreviews.value.splice(index, 1);
};

const removeExistingImage = (index) => {
  existingImages.value.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    formSubmitted.value = true;
    const { updateUrbanIssue } = useUrbanIssues();

    if (!form.value.id) {
      throw new Error("ไม่พบ ID ของข้อมูล");
    }

    if (!isFormValid.value) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const formData = new FormData();

    // ข้อมูลพื้นฐาน
    formData.append("name", form.value.name);
    formData.append("detail", form.value.detail);
    formData.append("type", form.value.type);
    formData.append("subcategory_id", form.value.subcategory_id);
    formData.append("ownership_id", form.value.ownership_id);
    formData.append("stakeholder_id", form.value.stakeholder_id);
    formData.append("email", props.userEmail);
    formData.append("geom", form.value.geom);

    // เพิ่ม extra_data ถ้ามี
    if (hasExtraFields.value) {
      const extraDataToSend = {
        ...extraData.value,
        // total_children: parseInt(extraData.value.total_children),
        // children_under_two: parseInt(extraData.value.children_under_two),
        // caretakers: parseInt(extraData.value.caretakers),
        // rooms: parseInt(extraData.value.rooms),
        // free_per_month: parseInt(extraData.fee_per_month),
        // location_type:
      };
      console.log(extraDataToSend);
      formData.append("extra_data", JSON.stringify(extraDataToSend));
    }

    // total_children: parseInt(extraDataObj.total_children) || 0,
    //       children_under_two: parseInt(extraDataObj.children_under_two) || 0,
    //       caretakers: parseInt(extraDataObj.caretakers) || 0,
    //       caretakers_bachelor: parseInt(extraDataObj.caretakers_bachelor) || 0,
    //       rooms: parseInt(extraDataObj.rooms) || 0,
    //       fee_per_month: parseInt(extraDataObj.fee_per_month) || 0,
    //       location_type: extraDataObj.location_type || "",
    //       survey_date: extraDataObj.survey_date || "",
    //       caretaker_feedback: extraDataObj.caretaker_feedback || "",
    //       surveyor_feedback: extraDataObj.surveyor_feedback || "",
    //       building_feedback: extraDataObj.building_feedback || "",
    //       urgent_building_feedback: extraDataObj.urgent_building_feedback || "",
    //       building_changes_feedback: extraDataObj.building_changes_feedback || "",
    //       kindergarten_feedback: extraDataObj.kindergarten_feedback || "",

    // จัดการรูปภาพใหม่
    uploadedFiles.value.forEach((file) => {
      formData.append(`images`, file);
    });

    // จัดการรูปภาพเดิม
    const existingImageUrls = existingImages.value
      .filter((image) => image && !image.isDeleted)
      .map((image) => image);

    formData.append("existing_images", JSON.stringify(existingImageUrls));

    await updateUrbanIssue(form.value.id, formData);
    toast.success("แก้ไขข้อมูลสำเร็จ");
    emit("updated");
    emit("cancel");
  } catch (error) {
    console.error("Error updating:", error);
    toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถแก้ไขข้อมูลได้"));
  }
};
</script>

<style scoped>
.group:hover button {
  opacity: 1;
}
</style>
