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
              <p class="text-sm text-gray-500">{{ config.public.systemName }}</p>
            </div>
          </NuxtLink>

          <!-- Logout -->
          <div class="flex flex-row items-center">
            <div class="mx-4 hidden sm:block">
              Nitikorn Bunyakulcharoen
            </div>
            <div class="">
              <a href="#" class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">Logout</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const config = useRuntimeConfig();
</script>
