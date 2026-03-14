import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh_token');
                if (refresh) {
                    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                        refresh: refresh
                    });

                    if (response.status === 200) {
                        localStorage.setItem('access_token', response.data.access);
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (authError) {
                // If refresh fails, redirect to login (handled by AuthContext or Router)
                console.error("Token refresh failed", authError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
