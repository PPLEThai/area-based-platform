<template>
  <UrbanIssueForm :province="province" />
</template>

<script setup>
import UrbanIssueForm from "@/components/forms/UrbanIssueForm.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const province = ref(route.params.province);
</script>
