import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://10.199.100.26:8000',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
})

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config;
}, error =>
    Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    alert("Bad Request: " + error.response.data.message);
                    break;
                case 401:
                    alert("Session expired. Please log in again.");
                    window.location.href = "/";
                    break;
                case 403:
                    alert("You don't have permission to access this resource.");
                    break;
                case 404:
                    alert("Requested resource not found.");
                    break;
                case 500:
                    alert("Internal server error. Please try again later.");
                    break;
                default:
                    alert("Something went wrong. Please try again.");
            }
        } else if (error.request) {
            alert("Network error. Please check your internet connection.");
        } else {
            alert("An unexpected error occurred.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;