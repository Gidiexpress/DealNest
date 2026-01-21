import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && process.env.NODE_ENV === 'production') {
    throw new Error("❌ NEXT_PUBLIC_API_URL is missing in production environment variables.");
}

const baseURL = API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    // DO NOT attach tokens for login or register endpoints
    const publicEndpoints = ['/auth/login/', '/auth/register/'];
    const isPublic = publicEndpoints.some(endpoint => config.url?.endsWith(endpoint));

    if (typeof window !== 'undefined' && !isPublic) {
        const token = localStorage.getItem('access_token');
        // Check if token exists and isn't just a string literal "null" or "undefined"
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If it's a 401 and not a retry and NOT a login/register request
        const publicEndpoints = ['/auth/login/', '/auth/register/', '/auth/refresh/'];
        const isPublic = publicEndpoints.some(endpoint => originalRequest.url?.endsWith(endpoint));

        if (error.response?.status === 401 && !originalRequest._retry && !isPublic) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
                    const { data } = await axios.post(`${API_URL}/auth/refresh/`, {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access_token', data.access);
                    api.defaults.headers['Authorization'] = `Bearer ${data.access}`;
                    return api(originalRequest);
                }
            } catch (err) {
                // Refresh failed: clear tokens and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
