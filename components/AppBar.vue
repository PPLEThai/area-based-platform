<template>
  <nav class="bg-white drop-shadow-md z-20">
    <div class="px-2 sm:px-6 lg:px-8 z-15">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button -->
        </div>

        <div class="flex items-center justify-between sm:items-stretch w-full">

          <!--  -->
          <NuxtLink to="/" class="flex shrink-0 items-center">
            <img class="h-8 w-auto" src="/images/logo-pp.png" alt="โลโก้พรรคประชาชน" />
            <div class="ml-4">
              <h1 class="text-lg font-bold text-gray-900">Hackable City</h1>
              <p class="text-sm text-gray-500">{{ systemName }}</p>
            </div>
          </NuxtLink>

          <div class="flex items-center">
            <img v-if="user.picture" :src="user.picture" alt="Avatar" class="h-8 w-8 rounded-full mr-2" />
            <span v-if="user.name" class="text-sm text-gray-700 mr-4">{{ user.name }}</span>
            <button @click="logout" class="px-4 py-2 bg-gray-900 text-white rounded">Logout</button>
          </div>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/useStore';

const config = useRuntimeConfig();
const systemName = config.public.systemName;
const userStore = useUserStore();
const user = userStore.$state;

const logout = () => {
  window.location.href = '/oauth2/sign_out';
  userStore.clearUser();
};
</script>
