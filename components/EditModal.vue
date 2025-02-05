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
      <div class="p-4 h-[70vh] md:h-full overflow-y-auto">
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

            <div>
              <Dropdowns
                :resetTrigger="resetDropdown"
                :initialCategoryId="getCategoryId"
                :initialSubcategoryId="form.subcategory_id"
                @selection-changed="handleSelectionChanged"
              />
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
import { ref, computed } from "vue";
import MapLibreEditModal from "./MapLibreEditModal.vue";
import { useToast } from "vue-toastification";
import { useUrbanIssues } from "@/composables/useUrbanIssues";
import * as Terraformer from "@terraformer/wkt";
import Dropdowns from "./Dropdowns.vue";

const props = defineProps({
  isOpen: Boolean,
  title: String,
  initialData: Object,
  userEmail: String,
});

const emit = defineEmits(["cancel", "confirm", "updated"]);
const toast = useToast();

const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const form = ref({
  id: props.initialData?.id || null,
  name: props.initialData?.name || "",
  detail: props.initialData?.detail || "",
  subcategory_id: props.initialData?.subcategory_id || null,
  geom: props.initialData?.geom || null,
});

const resetDropdown = ref(false);

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.detail &&
    form.value.subcategory_id !== "" &&
    form.value.geom
  );
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

const handleSubmit = async () => {
  try {
    const { updateUrbanIssue } = useUrbanIssues();

    if (!form.value.id) {
      throw new Error("ไม่พบ ID ของข้อมูล");
    }

    const payload = {
      // id: form.value.id,
      name: form.value.name,
      detail: form.value.detail,
      subcategory_id: form.value.subcategory_id,
      email: props.userEmail,
      geom: form.value.geom,
    };

    await updateUrbanIssue(form.value.id, payload);
    toast.success("แก้ไขข้อมูลสำเร็จ");
    emit("updated");
    emit("cancel");
  } catch (error) {
    console.error("Error updating:", error);
    toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถแก้ไขข้อมูลได้"));
  }
};
</script>
