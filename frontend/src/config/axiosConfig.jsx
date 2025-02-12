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

export default axiosInstance;