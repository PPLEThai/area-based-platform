<template>
  <div class="flex flex-col-reverse h-[calc(100%-64px)] md:flex-row md:h-full">
    <div class="w-5/5 md:w-2/5 p-4 shadow-lg h-[60%] md:h-full overflow-auto">
      <div class="py-2">
        <div class="text-primary font-bold">บันทึกข้อมูลแนวทางการแก้ปัญหา</div>
        <div class="text-gray-500 font-light text-sm">
          สามารถลากเลื่อนแผนที่ไปยังพิกัดที่ต้องการได้
        </div>
      </div>
      <hr class="my-2 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

      <form @submit.prevent="openConfirmModal">
        <div class="grid gap-6 mb-6 md:grid-cols-1">
          <div>
            <label for="title-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              หัวข้อ
            </label>
            <input type="text" id="title-name" v-model="titleName"
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="เช่น ปรับปรุงพื้นที่รกร้าง" />
            <p v-if="isSubmitted && !titleName.trim()" class="text-red-500 text-sm">
              กรุณากรอกหัวข้อ
            </p>
          </div>

          <div>
            <Dropdowns :resetTrigger="resetDropdown" @selection-changed="handleSelectionChanged" />
            <p v-if="isSubmitted && (!selectedCategory || !selectedSubcategory)" class="text-red-500 text-sm">
              กรุณาเลือกหมวดหมู่และหมวดหมู่ย่อย
            </p>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">การถือครอง</label>
            <select id="category" v-model="selectedOwnership"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
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
            <label for="detail-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              รายละเอียด
            </label>
            <textarea id="detail-name" rows="4" v-model="detailName"
              class="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="ใส่รายละเอียดที่นี่"></textarea>
            <p v-if="isSubmitted && !detailName.trim()" class="text-red-500 text-sm">
              กรุณากรอกรายละเอียด
            </p>
          </div>
        </div>

        <!-- Upload image -->
        <!-- <div class="grid gap-2 mb-2 md:grid-cols-1">
          <label
            class="block text-sm font-medium text-gray-900 dark:text-white"
            for="multiple_files"
            >อัปโหลดรูปภาพประกอบ (ไม่เกิน 5 รูป)</label
          >
          <input
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="multiple_files"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileUpload"
          />
          <p class="text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
            PNG, JPG (ขนาดไม่เกิน 800x400px และ 5MB).
          </p>
          <p
            v-if="isSubmitted && uploadedFiles.length === 0"
            class="text-red-500 text-sm"
          >
            กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป
          </p> -->

        <!-- แสดงตัวอย่างรูปภาพ -->
        <!-- <div v-if="filePreviews.length" class="mt-4 grid grid-cols-3 gap-2">
            <div v-for="(preview, index) in filePreviews" :key="index" class="relative">
              <img :src="preview" alt="Preview" class="w-full h-auto rounded-lg" />
              <button
                type="button"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                @click="removeFile(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div> -->

        <button type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
          Submit
        </button>
      </form>
    </div>

    <div class="w-5/5 md:w-3/5 h-[40%] md:h-full">
      <MapLibreTerraDraw :mapStyle="mapStyle" :center="[100.599186, 13.736717]" :zoom="10"
        @features-updated="updateFeatures" />
    </div>
    <Modal :isOpen="isModalOpen" title="ยืนยันการส่งข้อมูล" message="คุณแน่ใจหรือไม่ว่าต้องการส่งข้อมูลนี้?"
      @cancel="cancelSubmit" @confirm="confirmSubmit" />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/useStore';
import { useRouter } from '#app';
import { ref, onMounted } from "vue";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import { useToast } from "vue-toastification";
import { geojsonToWKT } from "@terraformer/wkt";
import Dropdowns from "@/components/Dropdowns.vue";
import MapLibreTerraDraw from "@/components/MapLibreTerraDraw.vue";
import Modal from "@/components/Modal.vue";

const userStore = useUserStore();
const user = userStore.$state;

const uploadedFiles = ref([]);
const filePreviews = ref([]);
const resetDropdown = ref(false);
const isModalOpen = ref(false);
const isSubmitted = ref(false);
const titleName = ref("");
const detailName = ref("");
const selectedCategory = ref(null);
const selectedSubcategory = ref(null);
const selectedOwnership = ref(null);
const geom = ref([]);
const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"; // free

const ownershipList = [
  { id: 1, name: "ท้องถิ่น" },
  { id: 2, name: "หน่วยงานอื่น" },
  { id: 3, name: "เอกชน" },
  { id: 4, name: "ไม่ทราบ" },
];

onMounted(() => { });

const handleSelectionChanged = (selectedDropdown) => {
  selectedCategory.value = selectedDropdown.selectedCategoryId;
  selectedSubcategory.value = selectedDropdown.selectedSubcategoryId;
};

const openConfirmModal = () => {
  isSubmitted.value = true;
  const toast = useToast();

  if (
    !titleName.value.trim() ||
    !selectedCategory.value ||
    !selectedSubcategory.value ||
    !detailName.value.trim() ||
    !selectedOwnership.value
    // this.uploadedFiles.length > -1
  ) {
    toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง", { timeout: 3000 });
    return;
  }

  if (geom.value.length === 0) {
    toast.error("กรุณาปักหมุดหรือวาดขอบเขตบนแผนที่", { timeout: 3000 });
    return;
  }

  // if (uploadedFiles.length === 0) {
  //   toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
  //   return;
  // }

  isModalOpen.value = true;
};

const cancelSubmit = () => {
  isModalOpen.value = false;
};

const confirmSubmit = async () => {
  const router = useRouter();
  isModalOpen.value = false;
  const toast = useToast();
  const payload = {
    name: titleName.value,
    subcategory_id: selectedSubcategory.value,
    ownership_id: selectedOwnership.value,
    creator_mail: user.email,
    detail: detailName.value,
    geom: geojsonToWKT(geom.value[0].geometry),
  };

  try {
    const { postUrbanIssue } = useUrbanIssues();
    const result = await postUrbanIssue(payload);
    toast.success("ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว!");
    resetForm();
    // Navigate to /items
    router.push('/items');
  } catch (error) {
    console.error('Error Details:', error);
    toast.error("Failed to submit issue. Please try again.");
  }
};

const resetForm = () => {
  isSubmitted.value = false;
  titleName.value = "";
  selectedCategory.value = null;
  selectedSubcategory.value = null;
  selectedOwnership.value = null;
  detailName.value = "";
  geom.value = [];
  resetDropdown.value = true;
  nextTick(() => {
    resetDropdown.value = false;
  });
};

const updateFeatures = (newFeatures) => {
  geom.value = newFeatures;
};

const handleFileUpload = (event) => {
  const files = event.target.files;

  // จำกัดจำนวนไฟล์ที่อัปโหลดได้ (สูงสุด 5 ไฟล์)
  if (files.length + uploadedFiles.length > 5) {
    const toast = useToast();
    toast.error("คุณสามารถอัปโหลดได้สูงสุด 5 รูปภาพเท่านั้น");
    return;
  }

  for (const file of files) {
    // ตรวจสอบว่าไฟล์เป็นรูปภาพ
    if (!file.type.startsWith("image/")) {
      const toast = useToast();
      toast.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ");
      continue;
    }

    // เพิ่มไฟล์ลงใน uploadedFiles
    uploadedFiles.push(file);

    // สร้าง URL สำหรับแสดงตัวอย่างรูป
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreviews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const removeFile = (index) => {
  uploadedFiles.splice(index, 1); // ลบไฟล์ออกจากอาร์เรย์
  filePreviews.splice(index, 1); // ลบรูปตัวอย่างออก
};
</script>
