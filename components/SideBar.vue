<template>
  <div class="drop-shadow-md bg-white flex flex-col justify-between">
    <div class="grid grid-cols-3 md:flex md:flex-col">
      <div
        v-for="menu in menus.filter((m) => m.show)"
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
</template>

<script setup>
import { ref, markRaw, onMounted } from "vue";

import SvgMarker from "@/components/Svg/SvgMarker.vue";
import SvgAnalysis from "@/components/Svg/SvgAnalysis.vue";
import SvgDashboard from "@/components/Svg/SvgDashboard.vue";
import SvgTable from "@/components/Svg/SvgTable.vue";
import SvgMap from "@/components/Svg/SvgMap.vue";

const menus = ref([
  {
    id: "location-sidebar",
    name: "บันทึก",
    role: "location",
    path: "/",
    icon: markRaw(SvgMarker),
    show: true,
  },
  {
    id: "dashboard-sidebar",
    name: "สถิติ",
    role: "dashboard",
    path: "/dashboard",
    icon: markRaw(SvgDashboard),
    show: false,
  },
  {
    id: "analysis-sidebar",
    name: "วิเคราะห์",
    role: "analysis",
    path: "/analysis",
    icon: markRaw(SvgAnalysis),
    show: false,
  },
  {
    id: "items-sidebar",
    name: "รายการ",
    role: "items",
    path: "/items",
    icon: markRaw(SvgTable),
    show: true,
  },
  {
    id: "map-sidebar",
    name: "แผนที่",
    role: "map",
    path: "/fullmap",
    icon: markRaw(SvgMap),
    show: true,
  },
]);
const checkModules = async () => {
  const modules = await $api.getModuleList();
  if (modules) {
    const roles = modules.roles;
    menus.value.forEach((menu) => {
      menu.show = roles.some((module) => module.name === menu.role);
    });
    isSetting.value = roles.some((module) => module.name === "settings");
  }
};
onMounted(async () => {
  // if ($keycloak.authenticated) {
  //   await checkModules();
  // }
});
</script>
