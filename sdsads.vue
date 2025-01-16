<template>
  <div class="font-anakotmai h-screen flex flex-col">
    <!-- Navbar -->
    <Navbar />
    <!-- Nuxt Layout and Page -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  components: {
    Navbar,
  },
};
</script>
