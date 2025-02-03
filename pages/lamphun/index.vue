<template>
  <div class="flex flex-col-reverse h-fit md:flex-row md:h-full">
    <!-- ส่วนของการบันทึกข้อมูล -->
    <div class="w-5/5 md:w-2/5 p-4 shadow-lg h-auto md:h-full">
      <div class="py-2">
        <div class="text-primary font-bold">บันทึกข้อมูลแนวทางการแก้ปัญหา</div>
        <div class="text-gray-500 font-light text-sm">
          สามารถลากเลื่อนแผนที่ไปยังพิกัดที่ต้องการได้
        </div>
      </div>
      <hr class="my-2 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

      <form @submit.prevent="openConfirmModal">
        <div class="grid gap-6 mb-6 grid-cols-1 md:grid-cols-1">
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

    <!-- ส่วนของแผนที่ -->
    <div class="w-5/5 md:w-3/5 h-[350px] md:h-full relative">
      <button @click="getCurrentLocation" :disabled="isGettingLocation"
        class="flex items-center absolute bottom-10 left-4 z-10 bg-primary p-2 rounded-lg shadow-md hover:bg-primary">
        <!-- marker icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        <p class="ml-2 text-sm font-bold text-white">
          {{ isGettingLocation ? 'กำลังระบุตำแหน่ง...' : 'ระบุตำแหน่งของท่าน' }}
        </p>
      </button>

      <!-- Progress bar -->
      <div v-if="isGettingLocation" class="absolute bottom-24 left-4 z-10 w-64 bg-white p-4 rounded-lg shadow-md">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-primary h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">กำลังค้นหาตำแหน่งของคุณ...</p>
      </div>

      <MapLibreLamphun :mapStyle="mapStyle" :center="[98.952368, 17.991376]" :zoom="8.4"
        @features-updated="updateFeatures" @mapLoaded="onMapLoaded" />
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
import MapLibreLamphun from "@/components/Lamphun/MapLibreLamphun.vue";
import Modal from "@/components/Modal.vue";
import maplibregl from "maplibre-gl";

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
// const mapStyle = ref("https://api.maptiler.com/maps/darkmatter/style.json?key=DMl4AxokgMPvgzLikrFx");
// const mapStyle = ref("https://api.maptiler.com/maps/streets-v2/style.json?key=DMl4AxokgMPvgzLikrFx");
const mapInstance = ref(null);
const isGettingLocation = ref(false);

const ownershipList = [
  { id: 1, name: "ท้องถิ่น" },
  { id: 2, name: "หน่วยงานอื่น" },
  { id: 3, name: "เอกชน" },
  { id: 4, name: "ไม่ทราบ" },
];

const onMapLoaded = async (map) => {
  mapInstance.value = map; // Store the MapLibre instance
  console.log(mapInstance.value)
};

onMounted(() => { });

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
      console.log(latitude, longitude);

      // เลื่อนแผนที่ไปยังตำแหน่งปัจจุบัน
      console.log(mapInstance);
      if (mapInstance.value) {
        // ลบ marker เดิมถ้ามีอยู่
        const markers = document.getElementsByClassName('maplibregl-marker');
        while(markers[0]) {
          markers[0].remove();
        }

        mapInstance.value.flyTo({
          center: [longitude, latitude],
          zoom: 15
        });

        // สร้างจุดบนแผนที่
        const point = {
          type: "Feature", 
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          properties: {}
        };

        // สร้าง marker แสดงตำแหน่งปัจจุบัน
        new maplibregl.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setHTML("ตำแหน่งปัจจุบันของคุณ"))
          .addTo(mapInstance.value);

        // อัพเดทค่า geom
        geom.value = [point];

        toast.success("ระบุตำแหน่งปัจจุบันสำเร็จ");
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
    router.push('/lamphun/items');
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
