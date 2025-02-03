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
        
        <div v-if="showDropdown && filteredProvinces.length > 0" 
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
  { id: 1, name: 'กรุงเทพฯ', path: '/bangkok' },
  { id: 2, name: 'กาฬสินธุ์', path: '/kalasin' },
  { id: 3, name: 'กาญจนบุรี', path: '/kanchanaburi' },
  { id: 4, name: 'ขอนแก่น', path: '/khonkaen' },
  { id: 5, name: 'จันทบุรี', path: '/chanthaburi' },
  { id: 6, name: 'ฉะเชิงเทรา', path: '/chachoengsao' },
  { id: 7, name: 'ชลบุรี', path: '/chonburi' },
  { id: 8, name: 'ตาก', path: '/tak' },
  { id: 9, name: 'ตราด', path: '/trat' },
  { id: 10, name: 'นครนายก', path: '/nakhonnayok' },
  { id: 11, name: 'นครปฐม', path: '/nakhonpathom' },
  { id: 12, name: 'นครราชสีมา', path: '/nakhonratchasima' },
  { id: 13, name: 'นครสวรรค์', path: '/nakhonsawan' },
  { id: 14, name: 'นนทบุรี', path: '/nonthaburi' },
  { id: 15, name: 'ลำปาง', path: '/lampang' },
  { id: 16, name: 'ลำพูน', path: '/lamphun' },
  { id: 17, name: 'มุกดาหาร', path: '/mukdahan' },
  { id: 18, name: 'ร้อยเอ็ด', path: '/roiet' },
  { id: 19, name: 'ระยอง', path: '/rayong' },
  { id: 20, name: 'ราชบุรี', path: '/ratchaburi' },
  { id: 21, name: 'สกลนคร', path: '/sakonNakhon' },
  { id: 22, name: 'สระแก้ว', path: '/sakaeo' },
  { id: 23, name: 'สมุทรปราการ', path: '/samutprakan' },
  { id: 24, name: 'สมุทรสงคราม', path: '/samutsongkhram' },
  { id: 25, name: 'สมุทรสาคร', path: '/samutsakhon' },
  { id: 26, name: 'สุราษฎร์ธานี', path: '/suratthani' },
  { id: 27, name: 'หนองคาย', path: '/nongkhai' },
  { id: 28, name: 'หนองบัวลำภู', path: '/nongbualamphu' },
  { id: 29, name: 'อุดรธานี', path: '/udonthani' },
  { id: 30, name: 'อุตรดิตถ์', path: '/uttaradit' },
  { id: 31, name: 'อุบลราชธานี', path: '/ubonratchathani' },
  { id: 32, name: 'เชียงใหม่', path: '/chiangmai' },
  { id: 33, name: 'ปราจีนบุรี', path: '/prachinburi' }
];

const searchQuery = ref('');
const showDropdown = ref(false);

const filteredProvinces = computed(() => {
  if (!searchQuery.value) return provinces;
  const query = searchQuery.value.toLowerCase();
  return provinces.filter(province => 
    province.name.toLowerCase().includes(query)
  );
});

// ปิด dropdown เมื่อคลิกนอก component
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.closest('.relative')) {
      showDropdown.value = false;
    }
  });
});
</script>