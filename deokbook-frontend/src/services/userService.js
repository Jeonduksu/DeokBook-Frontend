const API_BASE = '/api';

export const userService = {
    async getUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('사용자 목록 조회 실패');
        return response.json();
    },

    async createUser(user) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('사용자 생성 실패');
        return response.json();
    },

    async updateUser(id, user) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('사용자 수정 실패');
        return response.json();
    },

    async deleteUser(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('사용자 삭제 실패');
    }
};