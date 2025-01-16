export const useUrbanIssues = () => {
    const {
        $axios
    } = useNuxtApp(); // Access the Axios instance provided by the plugin

    const postUrbanIssue = async (payload) => {
        try {
            const response = await $axios.post('api/urbanissues', payload);
            return response.data; // Return the response data
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message); // Throw for better error handling
        }
    };

    const getUrbanIssues = async (params = {}) => {
        try {
            const response = await $axios.get('api/urbanissues', {
                params
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message);
        }
    };

    const deleteUrbanIssue = async (id, email) => {
        try {
            const response = await $axios.delete(`api/urbanissues/${id}`, {
                data: {
                    email
                }, // Send email in the request body
            });
            return response.data; // Return the response data
        } catch (error) {
            throw error.response ? error.response.data : new Error(error.message); // Throw for better error handling
        }
    };

    return {
        postUrbanIssue,
        getUrbanIssues,
        deleteUrbanIssue
    };
};