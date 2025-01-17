// plugins/initUser.js
import {
    useUserStore
} from '@/stores/useStore';

export default defineNuxtPlugin(async (nuxtApp) => {
    const userStore = useUserStore();
    const {
        $axios
    } = nuxtApp;

    await userStore.fetchUser($axios);
});