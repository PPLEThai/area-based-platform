import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Toast, {
        // Optional: Add global options here
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        hideProgressBar: false,
    });
});