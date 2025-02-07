<template>
  <div
    :class="[
      'drop-shadow-md bg-white flex flex-col z-30 sm:z-10',
      'md:relative',
      isMobileOpen ? 'fixed inset-0 w-48' : 'hidden md:flex',
    ]"
  >
    <div class="flex justify-end md:hidden p-4" v-if="isMobileOpen">
      <button @click="$emit('close')" class="text-gray-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <div class="flex flex-col md:flex-col">
      <!-- แสดงเมนูหน้าหลักตลอด -->
      <div
        v-for="menu in homeMenus"
        :key="menu.id"
        class="divide-y border-b-none md:border-b"
      >
        <NuxtLink :id="menu.id" :to="menu.path">
          <div
            :class="[
              'flex flex-col items-center p-3 text-sm font-medium',
              {
                'bg-primary text-white': $router.currentRoute.value.path === menu.path,
              },
              {
                'hover:text-black hover:bg-subprimary':
                  $router.currentRoute.value.path !== menu.path,
              },
            ]"
          >
            <component :is="menu.icon" class="w-4 h-4" />
            <div class="text-sm mt-1 text-nowrap">
              {{ menu.name }}
            </div>
          </div>
        </NuxtLink>
      </div>
      <!-- แสดงเมนูตามเมือง -->
      <div v-for="cityGroup in groupedCityMenus" :key="cityGroup.city">
        <div class="bg-white text-orange-500 p-2 font-medium text-center border-b">
          {{ cityGroup.cityName }}
        </div>
        <div
          v-for="menu in cityGroup.menus"
          :key="menu.id"
          class="divide-y border-b-none md:border-b"
        >
          <NuxtLink :id="menu.id" :to="menu.path">
            <div
              :class="[
                'flex flex-col items-center p-3 text-sm font-medium',
                {
                  'bg-primary text-white': $router.currentRoute.value.path === menu.path,
                },
                {
                  'hover:text-black hover:bg-subprimary':
                    $router.currentRoute.value.path !== menu.path,
                },
              ]"
            >
              <component :is="menu.icon" class="w-4 h-4" />
              <div class="text-sm mt-1 text-nowrap">
                {{ menu.name }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from "vue";
import { useRoute } from "vue-router";
import { useProvinces } from "@/composables/useProvinces";
import { useProvinceMenus } from "@/composables/useProvinceMenus";

import SvgDashboard from "@/components/Svg/SvgDashboard.vue";
import SvgHome from "@/components/Svg/SvgHome.vue";

const route = useRoute();
const { provinces } = useProvinces();
const { getProvinceMenus } = useProvinceMenus();

// เมนูหน้าหลัก
const homeMenus = [
  {
    id: "home",
    name: "หน้าหลัก",
    role: "home",
    path: "/",
    icon: markRaw(SvgHome),
    city: "home",
  },
  {
    id: "dashboard",
    name: "แดชบอร์ด",
    role: "dashboard",
    path: "/dashboard",
    icon: markRaw(SvgDashboard),
    city: "home",
  },
];

// จัดกลุ่มเมนูตามเมือง
const groupedCityMenus = computed(() => {
  const currentPath = route.path;
  const pathSegments = currentPath.split("/");
  const currentCity = pathSegments[1] || "home";

  if (currentCity === "home" || currentCity === "dashboard") {
    return [];
  }

  const province = provinces.find((p) => p.path === currentCity);
  if (!province) return [];

  return [
    {
      city: currentCity,
      cityName: province.name,
      menus: getProvinceMenus(currentCity, province.name),
    },
  ];
});

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);
</script>
