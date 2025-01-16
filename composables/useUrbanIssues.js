export const useUrbanIssues = () => {
    const {
        $axios
    } = useNuxtApp(); // Access the Axios instance provided by the plugin

    const postUrbanIssue = async (payload) => {
        try {
            const response = await $axios.post('/urbanissues', payload);
            return response.data; // Return the response data
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message); // Throw for better error handling
        }
    };

    const getUrbanIssues = async (params = {}) => {
        try {
            const response = await $axios.get('/urbanissues', {
                params
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message);
        }
    };

    const deleteUrbanIssue = async (id, email) => {
        try {
            const response = await $axios.delete(`/urbanissues/${id}`, {
                data: {
                    email
                }, // Send email in the request body
            });
            return response.data; // Return the response data
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message); // Throw for better error handling
        }
    };

    const updateUrbanIssue = async (id, payload) => {
        try {
            const response = await $axios.patch(`/urbanissues/${id}`, payload, {
                headers: {
                    'Content-Type': 'application/json', // Ensure proper content type
                },
            });
            return response.data; // Return the response data
        } catch (error) {
            // Throw error response data for better error handling
            throw error.response ? error.response.data : new Error(error.message);
        }
    };

    return {
        postUrbanIssue,
        getUrbanIssues,
        deleteUrbanIssue,
        updateUrbanIssue
    };
};