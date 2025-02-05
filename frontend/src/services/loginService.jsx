import axiosInstance from "../config/axiosConfig";

export const onLogin = (userData) => {
    return axiosInstance.post("login",userData);
};

export const onLogout = () => {
    return axiosInstance.get("/logout", { withCredentials: true });
};