<template>
  <div class="h-screen flex flex-col">
    <main class="h-screen flex flex-col font-anakotmai">
      <div class="flex flex-col">
        <AppBar />
        <div class="flex flex-col-reverse md:flex-row h-[calc(100vh-96px)]">
          <SideBar />
          <NuxtPage class="w-full" />
        </div>
        <AppFooter />
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

onMounted(() => {
  console.log("Page mounted");
});
</script>
