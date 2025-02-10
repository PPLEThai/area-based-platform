<template>
  <div class="flex flex-col h-full md:h-full items-center justify-center bg-gray-100">
    <div class="flex flex-col gap-4 w-80 pb-4">
      <h1 class="text-2xl font-bold text-center text-gray-800">
        เลือกจังหวัดที่ต้องการบันทึก
      </h1>

      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="ค้นหาจังหวัด..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @focus="showDropdown = true"
        />

        <div
          v-if="showDropdown && filteredProvinces.length > 0"
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <NuxtLink
            v-for="province in filteredProvinces"
            :key="province.id"
            :to="province.path"
            class="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="showDropdown = false"
          >
            {{ province.name }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- <div class="bg-white p-6 rounded-lg shadow-md text-gray-700 space-y-4 w-84">
      <h2 class="text-lg font-semibold">
        วิธีการใช้งานระบบ Hackable City สำหรับบันทึกข้อมูลบนเว็บไซต์
      </h2>
      <p class="text-sm">
        ระบบ Hackable City พรรคประชาชน ออกแบบมาเพื่อให้ผู้ใช้งานสามารถบันทึกปัญหา
        หรือนโยบายที่เกี่ยวข้องกับพื้นที่ต่างๆ ได้อย่างสะดวก และแม่นยำ
        โดยมีขั้นตอนการใช้งานดังนี้
      </p>

      <div class="space-y-3 text-sm">
        <div>
          <p><span class="font-medium">🏙️ 1. เลือกจังหวัด</span></p>
          <p class="pl-6">เริ่มต้นโดยเลือกจังหวัดที่ต้องการบันทึกข้อมูล</p>
        </div>

        <div>
          <p><span class="font-medium">📝 2. กรอกรายละเอียดปัญหาหรือนโยบาย</span></p>
          <p class="pl-6">ใส่ข้อมูลเกี่ยวกับปัญหาที่พบหรือแนวทางนโยบายที่ต้องการเสนอ</p>
        </div>

        <div>
          <p>
            <span class="font-medium">🗺️ 3. วาดขอบเขตพื้นที่หรือปักหมุดบนแผนที่</span>
          </p>
          <p class="pl-6">
            สามารถ ปักหมุด เพื่อระบุจุดที่เกี่ยวข้องกับข้อมูล หรือใช้เครื่องมือ วาดขอบเขต
            เพื่อกำหนดพื้นที่ที่ได้รับผลกระทบ
          </p>
        </div>

        <div>
          <p><span class="font-medium">💾 4. กดเพื่อบันทึกข้อมูล</span></p>
          <p class="pl-6">
            เมื่อใส่ข้อมูลครบถ้วนแล้ว ให้กด "บันทึก"
            ข้อมูลจะถูกจัดเก็บในระบบและสามารถนำไปใช้วิเคราะห์หรือปรับปรุงนโยบายได้ต่อไป
          </p>
        </div>
      </div>

      <p class="text-center text-sm font-medium pt-2">
        ✨ ร่วมเป็นส่วนหนึ่งในการพัฒนาเมืองได้ง่ายๆ ผ่าน Hackable City​ Platform! 🚀
      </p>
    </div> -->
  </div>
</template>

<script setup>
import { useProvinces } from "@/composables/useProvinces";

const { provinces } = useProvinces();

const searchQuery = ref("");
const showDropdown = ref(false);

const filteredProvinces = computed(() => {
  if (!searchQuery.value) return provinces;
  const query = searchQuery.value.toLowerCase();
  return provinces.filter((province) => province.name.toLowerCase().includes(query));
});

// ปิด dropdown เมื่อคลิกนอก component
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".relative")) {
      showDropdown.value = false;
    }
  });
});
</script>
