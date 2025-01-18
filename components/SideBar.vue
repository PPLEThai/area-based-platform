<template>
  <div :class="[
    'drop-shadow-md bg-white flex flex-col z-30',
    'md:relative',
    isMobileOpen ? 'fixed inset-0 w-48' : 'hidden md:flex'
  ]">
    <div class="flex justify-end md:hidden p-4" v-if="isMobileOpen">
      <button @click="$emit('close')" class="text-gray-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="flex flex-col md:flex-col">
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
import SvgAddPin from "@/components/Svg/SvgAddPin.vue";
import SvgDashboard from "@/components/Svg/SvgDashboard.vue";
import SvgTable from "@/components/Svg/SvgTable.vue";
import SvgMap from "@/components/Svg/SvgMap.vue";

const menus = ref([
  {
    id: "location-sidebar",
    name: "บันทึก",
    role: "location",
    path: "/",
    icon: markRaw(SvgAddPin),
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
  {
    id: "fondue-sidebar",
    name: "Fondue",
    role: "fondue",
    path: "/fondue",
    icon: markRaw(SvgMarker),
    show: true,
  },
]);

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

onMounted(async () => {
});
</script>
