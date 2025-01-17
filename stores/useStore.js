import { defineStore } from 'pinia';


export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    name: null,
    email: null,
    picture: null,
  }),
  actions: {
    async fetchUser($axios) {
      try {
        const response = await $axios.get('/auth/me');
        this.setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error.response ? error.response.data : error.message);
      }
    },
    setUser(userData) {
      this.id = userData.id;
      this.name = userData.name;
      this.email = userData.email;
      this.picture = userData.picture;
    },
    clearUser() {
      this.id = null;
      this.name = null;
      this.email = null;
      this.picture = null;
    },
  },
});