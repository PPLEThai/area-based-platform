import { useUserStore } from "@/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
    const reqHeaders = useRequestHeaders();
    const cookieHeader = reqHeaders.cookie || "";
    const cookies = parseCookies(cookieHeader);
    const userEmail = reqHeaders['x-auth-request-email'];
    console.log(userEmail)
    console.log(cookies["_oauth2_proxy"])

    if (userEmail) {
        const userStore = useUserStore();
        userStore.setUserEmail(userEmail); // บันทึกอีเมลลง Store
    }
});

function parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader
        .split(";")
        .map((cookie) => cookie.trim().split("="))
        .reduce((acc, [key, value]) => {
            acc[key] = decodeURIComponent(value || "");
            return acc;
        }, {} as Record<string, string>);
}