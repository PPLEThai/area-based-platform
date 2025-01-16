import axios from 'axios';

export default defineNuxtPlugin(() => {
    // Create a new Axios instance
    const config = useRuntimeConfig();
    const axiosInstance = axios.create({
        baseURL: config.public.apiBaseUrl, // Use API base URL from runtime config
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Interceptors
    axiosInstance.interceptors.request.use((config) => {
        console.log('Making request to:', config.url);
        return config;
    });

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('Error response:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    );

    // Inject the instance globally as `$axios`
    return {
        provide: {
            axios: axiosInstance,
        },
    };
});