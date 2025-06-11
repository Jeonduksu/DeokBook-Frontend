export const loanService = {
    async getLoans() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/loans`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('대출 목록 조회 실패');
        return response.json();
    },

    async loanBook(userId, bookId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/loans?userId=${userId}&bookId=${bookId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('대출 처리 실패');
        return response.json();
    },

    async returnBook(userId, bookId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/loans/returns?userId=${userId}&bookId=${bookId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('반납 처리 실패');
        return response.json();
    }
};