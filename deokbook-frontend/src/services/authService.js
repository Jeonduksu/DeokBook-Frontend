import apiService from './api';

export const authService = {
    async login(credentials) {
        const response = await apiService.post('/api/auth/login', credentials);
        if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        return response;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};