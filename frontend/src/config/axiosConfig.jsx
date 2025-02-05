import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
    // headers: {
    //     'Access-Control-Allow-Origin': '*',
    //     'Accept': 'application/json, text/plain, */*',
    //     'Content-Type': 'application/json',
    // }
});

export default axiosInstance;