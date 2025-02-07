<template>
  <nav class="bg-white drop-shadow-md z-20">
    <div class="px-2 sm:px-6 lg:px-8 z-15">
      <div class="relative flex h-16 items-center justify-between">
        <div class="inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            @click="toggleSidebar"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <span class="sr-only">เปิดเมนู</span>
            <svg
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        <div class="flex items-center justify-between sm:items-stretch w-full">
          <!--  -->
          <NuxtLink to="/" class="flex shrink-0 items-center">
            <img class="h-8 w-auto" src="/images/logo-pp.png" alt="โลโก้พรรคประชาชน" />
            <div class="ml-4">
              <h1 class="text-lg font-bold text-gray-900">Hackable City</h1>
              <p class="text-sm text-gray-500">{{ displaySystemName }}</p>
            </div>
          </NuxtLink>

          <div class="flex items-center">
            <img
              v-if="user.picture"
              :src="user.picture"
              alt="Avatar"
              class="h-8 w-8 rounded-full mr-2"
            />
            <span v-if="user.name" class="hidden sm:block text-sm text-gray-700 mr-4">{{
              user.name
            }}</span>
            <button @click="logout" class="px-4 py-2 bg-gray-900 text-white rounded">
              <span class="hidden sm:inline">Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 sm:hidden"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from "@/stores/useStore";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useProvinces } from "@/composables/useProvinces";

const emit = defineEmits(["toggle-sidebar"]);

const config = useRuntimeConfig();
const systemName = config.public.systemName;
const userStore = useUserStore();
const user = userStore.$state;
const route = useRoute();
const { provinces } = useProvinces();

const displaySystemName = computed(() => {
  const province = route.params.province;
  if (!province) {
    return "กระบวนการเดินเมือง";
  }

  const provinceData = provinces.find((p) => p.path === province);
  if (!provinceData) {
    return "กระบวนการเดินเมือง";
  }

  const organizationMap = {
    bangkok: "กรุงเทพมหานคร",
    lamphun: "องค์การบริหารส่วนจังหวัดลำพูน",
  };

  return organizationMap[province] || provinceData.name;
});

const logout = () => {
  window.location.href = "/oauth2/sign_out";
  userStore.clearUser();
};

const toggleSidebar = () => {
  emit("toggle-sidebar");
};
</script>
