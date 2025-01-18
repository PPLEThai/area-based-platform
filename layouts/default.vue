<template>
  <div class="h-screen flex flex-col">
    <main class="h-full flex flex-col font-anakotmai">
      <div class="flex flex-col">
        <AppBar @toggle-sidebar="toggleSidebar" />
        <div class="flex flex-row h-[calc(100vh-96px)]">
          <SideBar 
            :isMobileOpen="isSidebarOpen" 
            @close="closeSidebar" 
          />
          <div 
            v-if="isSidebarOpen" 
            class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            @click="closeSidebar"
          ></div>
          <NuxtPage class="w-full" />
        </div>
        <AppFooter/>
      </div>
    </main>
  </div>
</template>

<script setup>
import AppBar from "@/components/AppBar.vue";
import SideBar from "@/components/SideBar.vue";
import AppFooter from "@/components/AppFooter.vue";

const config = useRuntimeConfig();
const isAuthenticated = ref(true);
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

onMounted(() => {
  console.log("Page mounted");
});
</script>
