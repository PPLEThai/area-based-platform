<template>
  <div class="dashboard p-4">
    <h1 class="text-2xl font-bold mb-4">สถิติการปักหมุด</h1>
    
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="text-xl font-semibold mb-4">ผู้ใช้ที่มีการปักหมุดมากที่สุด</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">อันดับ</th>
              <th class="px-4 py-2 text-left">ชื่อผู้ใช้</th>
              <th class="px-4 py-2 text-left">อีเมล</th>
              <th class="px-4 py-2 text-right">จำนวนการปักหมุด</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in userStats" :key="user.id" class="border-b">
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">{{ user.creator_mail }}</td>
              <td class="px-4 py-2 text-right">{{ user.issue_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUrbanIssues } from '@/composables/useUrbanIssues'
import { useToast } from 'vue-toastification'

const toast = useToast()
const userStats = ref([])
const loading = ref(false)
const error = ref(null)

const fetchUserStats = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { getStatsUrbanIssue } = useUrbanIssues()
    const response = await getStatsUrbanIssue()
    console.log(response)
    // Group by user and count pins
    userStats.value = response

  } catch (err) {
    error.value = 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserStats()
})
</script>
