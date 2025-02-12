<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div v-if="isConnected" class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div class="text-green-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h1 class="text-xl font-bold mb-6">
          ระบบเชื่อมต่อบัญชี LINE ของท่านกับ Google Account เรียบร้อยแล้ว
        </h1>

        <a 
          href="https://line.me/R/ti/p/@534tvqeu"
          class="bg-[#00B900] hover:bg-[#009900] text-white font-bold py-3 px-6 rounded-lg w-full inline-block"
        >
          กลับสู่แอปฯ LINE
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';

const route = useRoute();
const toast = useToast();

const { $axios } = useNuxtApp();

const isConnected = ref(false);

onMounted(async () => {
  const luid = route.query.luid;
  
  if (!luid) {
    toast.error('ไม่พบข้อมูล LINE User ID');
    return;
  }

  try {
    await $axios.get(`/line-connect`, {
      params: { luid }
    });
    isConnected.value = true;
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
  }
});

</script>
