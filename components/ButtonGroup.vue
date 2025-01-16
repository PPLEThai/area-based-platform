<template>
  <div class="inline-flex rounded-md shadow-sm">
    <button
      v-for="(button, index) in buttons"
      :key="index"
      type="button"
      :class="[
        'px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
        index === 0 ? 'rounded-l-md' : '',
        index === buttons.length - 1 ? 'rounded-r-md' : '',
        activeIndex === index
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ]"
      @click="handleClick(index)"
    >
      {{ button.label }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    buttons: {
      type: Array,
      required: true,
    },
    defaultLabel: {
      type: String,
      default: "จุด", // Label ของปุ่มที่ต้องการให้ active ตอนเริ่มต้น
    },
  },
  data() {
    return {
      activeIndex: -1, // เริ่มต้นเป็น -1 แล้วคำนวณใน mounted
    };
  },
  mounted() {
    // ค้นหา index ของปุ่มที่ตรงกับ defaultLabel และตั้งค่า activeIndex
    const defaultIndex = this.buttons.findIndex(
      (button) => button.label === this.defaultLabel
    );
    if (defaultIndex !== -1) {
      this.activeIndex = defaultIndex;
    }
  },
  methods: {
    handleClick(index) {
      this.activeIndex = index;
      this.$emit("button-click", this.buttons[index]); // ส่งข้อมูลปุ่มที่ถูกคลิกกลับไปยัง parent
    },
  },
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
