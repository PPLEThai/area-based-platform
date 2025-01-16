<template>
    <div class="flex items-center justify-center h-screen bg-gray-100">
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h1 class="text-2xl font-bold text-ci mb-4">Login</h1>
            <form @submit.prevent="handleLogin">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Username</label>
                    <input v-model="username" type="text" class="border border-gray-300 p-2 w-full rounded-lg" />
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Password</label>
                    <input v-model="password" type="password" class="border border-gray-300 p-2 w-full rounded-lg" />
                </div>
                <button type="submit" class="bg-ci text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                    Login
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
    if (username.value === 'admin' && password.value === '12345') {
        alert('Login Successful');
        router.push('/');
    } else {
        alert('Invalid Credentials');
    }
};
</script>