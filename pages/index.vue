<template>
  <div class="flex h-full md:flex-row md:h-full items-center justify-center bg-gray-100">
    <div class="flex flex-col gap-4 w-80">
      <h1 class="text-2xl font-bold text-center text-gray-800">เลือกจังหวัด</h1>

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
  </div>
</template>

<script setup>
const provinces = [
  { id: 10, name: "กรุงเทพมหานคร", path: "/bangkok" },
  { id: 11, name: "สมุทรปราการ", path: "/samutprakan" },
  { id: 12, name: "นนทบุรี", path: "/nonthaburi" },
  { id: 13, name: "ปทุมธานี", path: "/pathumthani" },
  { id: 14, name: "พระนครศรีอยุธยา", path: "/ayutthaya" },
  { id: 15, name: "อ่างทอง", path: "/angthong" },
  { id: 16, name: "ลพบุรี", path: "/lopburi" },
  { id: 17, name: "สิงห์บุรี", path: "/singburi" },
  { id: 18, name: "ชัยนาท", path: "/chainat" },
  { id: 19, name: "สระบุรี", path: "/saraburi" },
  { id: 20, name: "ชลบุรี", path: "/chonburi" },
  { id: 21, name: "ระยอง", path: "/rayong" },
  { id: 22, name: "จันทบุรี", path: "/chanthaburi" },
  { id: 23, name: "ตราด", path: "/trat" },
  { id: 24, name: "ฉะเชิงเทรา", path: "/chachoengsao" },
  { id: 25, name: "ปราจีนบุรี", path: "/prachinburi" },
  { id: 26, name: "นครนายก", path: "/nakhonnayok" },
  { id: 27, name: "สระแก้ว", path: "/sakaeo" },
  { id: 30, name: "นครราชสีมา", path: "/nakhonratchasima" },
  { id: 31, name: "บุรีรัมย์", path: "/buriram" },
  { id: 32, name: "สุรินทร์", path: "/surin" },
  { id: 33, name: "ศรีสะเกษ", path: "/sisaket" },
  { id: 34, name: "อุบลราชธานี", path: "/ubonratchathani" },
  { id: 35, name: "ยโสธร", path: "/yasothon" },
  { id: 36, name: "ชัยภูมิ", path: "/chaiyaphum" },
  { id: 37, name: "อำนาจเจริญ", path: "/amnatcharoen" },
  { id: 38, name: "บึงกาฬ", path: "/bungkan" },
  { id: 39, name: "หนองบัวลำภู", path: "/nongbualamphu" },
  { id: 40, name: "ขอนแก่น", path: "/khonkaen" },
  { id: 41, name: "อุดรธานี", path: "/udonthani" },
  { id: 42, name: "เลย", path: "/loei" },
  { id: 43, name: "หนองคาย", path: "/nongkhai" },
  { id: 44, name: "มหาสารคาม", path: "/mahasarakham" },
  { id: 45, name: "ร้อยเอ็ด", path: "/roiet" },
  { id: 46, name: "กาฬสินธุ์", path: "/kalasin" },
  { id: 47, name: "สกลนคร", path: "/sakonnakhon" },
  { id: 48, name: "นครพนม", path: "/nakhonphanom" },
  { id: 49, name: "มุกดาหาร", path: "/mukdahan" },
  { id: 50, name: "เชียงใหม่", path: "/chiangmai" },
  { id: 51, name: "ลำพูน", path: "/lamphun" },
  { id: 52, name: "ลำปาง", path: "/lampang" },
  { id: 53, name: "อุตรดิตถ์", path: "/uttaradit" },
  { id: 54, name: "แพร่", path: "/phrae" },
  { id: 55, name: "น่าน", path: "/nan" },
  { id: 56, name: "พะเยา", path: "/phayao" },
  { id: 57, name: "เชียงราย", path: "/chiangrai" },
  { id: 58, name: "แม่ฮ่องสอน", path: "/maehongson" },
  { id: 60, name: "นครสวรรค์", path: "/nakhonsawan" },
  { id: 61, name: "อุทัยธานี", path: "/uthaithani" },
  { id: 62, name: "กำแพงเพชร", path: "/kamphaengphet" },
  { id: 63, name: "ตาก", path: "/tak" },
  { id: 64, name: "สุโขทัย", path: "/sukhothai" },
  { id: 65, name: "พิษณุโลก", path: "/phitsanulok" },
  { id: 66, name: "พิจิตร", path: "/phichit" },
  { id: 67, name: "เพชรบูรณ์", path: "/phetchabun" },
  { id: 70, name: "ราชบุรี", path: "/ratchaburi" },
  { id: 71, name: "กาญจนบุรี", path: "/kanchanaburi" },
  { id: 72, name: "สุพรรณบุรี", path: "/suphanburi" },
  { id: 73, name: "นครปฐม", path: "/nakhonpathom" },
  { id: 74, name: "สมุทรสาคร", path: "/samutsakhon" },
  { id: 75, name: "สมุทรสงคราม", path: "/samutsongkhram" },
  { id: 76, name: "เพชรบุรี", path: "/phetchaburi" },
  { id: 77, name: "ประจวบคีรีขันธ์", path: "/prachuapkhirikhan" },
  { id: 80, name: "นครศรีธรรมราช", path: "/nakhonsithammarat" },
  { id: 81, name: "กระบี่", path: "/krabi" },
  { id: 82, name: "พังงา", path: "/phangnga" },
  { id: 83, name: "ภูเก็ต", path: "/phuket" },
  { id: 84, name: "สุราษฎร์ธานี", path: "/suratthani" },
  { id: 85, name: "ระนอง", path: "/ranong" },
  { id: 86, name: "ชุมพร", path: "/chumphon" },
  { id: 90, name: "สงขลา", path: "/songkhla" },
  { id: 91, name: "สตูล", path: "/satun" },
  { id: 92, name: "ตรัง", path: "/trang" },
  { id: 93, name: "พัทลุง", path: "/phatthalung" },
  { id: 94, name: "ปัตตานี", path: "/pattani" },
  { id: 95, name: "ยะลา", path: "/yala" },
  { id: 96, name: "นราธิวาส", path: "/narathiwat" },
];

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
