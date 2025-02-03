import axios from 'axios';

export const onLogin = (userData) => {
    return axios.post("http://10.199.100.137:3000/login",userData);
};

export const onLogout = () => {
    return axios.get("http://10.199.100.137:3000/logout", { withCredentials: true });
};