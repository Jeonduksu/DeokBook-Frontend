export const bookService = {
    async getBooks() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/books`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('도서 목록 조회 실패');
        return response.json();
    },

    async getBooksForUser() {
        const response = await fetch(`${API_BASE}/book`);
        if (!response.ok) throw new Error('도서 목록 조회 실패');
        return response.json();
    },

    async createBook(book) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(book)
        });
        if (!response.ok) throw new Error('도서 생성 실패');
        return response.json();
    },

    async updateBook(id, book) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/book/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(book)
        });
        if (!response.ok) throw new Error('도서 수정 실패');
        return response.json();
    }
};