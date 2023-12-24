import axios from "axios";
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

type NotificationCallback = (message: string) => void;
interface NotificationEmitter {
    listeners: NotificationCallback[];
    subscribe(callback: NotificationCallback): void;
    notify(message: string): void;
}

export const notificationEmitter: NotificationEmitter = {
    listeners: [],

    subscribe(callback: NotificationCallback) {
        this.listeners.push(callback);
    },

    notify(message: string) {
        this.listeners.forEach((listener) => listener(message));
    },
};


axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (config.headers)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use((response) => {
    return response;
},
    (error) => {
        console.log(error);
        notificationEmitter.notify(error.message);
        //call some notification api here
        const { response } = error;
        if (response.status === 401) {
            localStorage.removeItem('ACCESS_TOKEN')
        }
        throw error;
    })

export default axiosClient;
