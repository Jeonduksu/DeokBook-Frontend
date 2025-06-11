// src/components/admin/BookManagement.js
import React, { useState } from 'react';
import { Plus, Edit2, Search, Filter, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { bookService } from '../../services/bookService';
import LoadingSpinner from '../common/LoadingSpinner';
import Model from '../common/Model';
import Table from '../common/Table';

const BookManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publisher: '',
        publishedDate: '',
        price: '',
        status: 'Y'
    });

    // API 호출 - 도서 목록 로드
    const { data: books, loading, error, refetch } = useApi(
        () => bookService.getBooks(),
        []
    );

    // 필터링된 도서 목록
    const filteredBooks = React.useMemo(() => {
        if (!books) return [];

        return books.filter(book => {
            const matchesSearch = searchTerm === '' ||
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.publisher.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || book.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [books, searchTerm, statusFilter]);

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookData = {
                ...formData,
                price: parseInt(formData.price) || 0
            };

            if (editingBook) {
                await bookService.updateBook(editingBook.id, bookData);
            } else {
                await bookService.createBook(bookData);
            }
            await refetch();
            resetForm();
        } catch (err) {
            console.error('도서 저장 실패:', err);
            alert('도서 저장에 실패했습니다: ' + err.message);
        }
    };

    // 도서 수정
    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            publishedDate: book.publishedDate || '',
            price: book.price?.toString() || '',
            status: book.status
        });
        setShowForm(true);
    };

    // 도서 상태 토글 (대출가능/불가)
    const handleToggleStatus = async (book) => {
        try {
            const newStatus = book.status === 'Y' ? 'N' : 'Y';
            await bookService.updateBook(book.id, { ...book, status: newStatus });
            await refetch();
        } catch (err) {
            console.error('도서 상태 변경 실패:', err);
            alert('도서 상태 변경에 실패했습니다: ' + err.message);
        }
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            publisher: '',
            publishedDate: '',
            price: '',
            status: 'Y'
        });
        setEditingBook(null);
        setShowForm(false);
    };

    // 폼 입력 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 테이블 컬럼 정의
    const columns = [
        { key: 'id', header: 'ID' },
        {
            key: 'title',
            header: '제목',
            render: (value, book) => (
                <div className="max-w-xs">
                    <div className="font-medium truncate" title={value}>{value}</div>
                </div>
            )
        },
        { key: 'author', header: '저자' },
        { key: 'publisher', header: '출판사' },
        { key: 'publishedDate', header: '출간년도' },
        {
            key: 'price',
            header: '가격',
            render: (value) => value ? `${value.toLocaleString()}원` : '-'
        },
        {
            key: 'status',
            header: '상태',
            render: (value, book) => (
                <button
                    onClick={() => handleToggleStatus(book)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        value === 'Y'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    title="클릭하여 상태 변경"
                >
                    {value === 'Y' ? (
                        <>
                            <CheckCircle size={12} className="inline mr-1" />
                            대출가능
                        </>
                    ) : (
                        <>
                            <XCircle size={12} className="inline mr-1" />
                            대출불가
                        </>
                    )}
                </button>
            )
        }
    ];

    // 테이블 액션 정의
    const actions = [
        {
            icon: <Edit2 size={16} />,
            onClick: handleEdit,
            className: 'text-blue-600 hover:text-blue-800',
            title: '수정'
        }
    ];

    if (loading) return <LoadingSpinner text="도서 목록을 불러오는 중..." />;
    if (error) return <div className="text-red-600">오류: {error}</div>;

    return (
        <div>
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">도서 관리</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Plus size={16} />
                    도서 등록
                </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="제목, 저자, 출판사로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">전체</option>
                            <option value="Y">대출가능</option>
                            <option value="N">대출불가</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 도서 등록/수정 모달 */}
            <Model
                isOpen={showForm}
                onClose={resetForm}
                title={editingBook ? '도서 수정' : '도서 등록'}
                size="large"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                제목 *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="도서 제목을 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                저자 *
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="저자명을 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                출판사 *
                            </label>
                            <input
                                type="text"
                                name="publisher"
                                value={formData.publisher}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="출판사를 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                출간년도
                            </label>
                            <input
                                type="text"
                                name="publishedDate"
                                value={formData.publishedDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="2024"
                                pattern="[0-9]{4}"
                                title="4자리 년도를 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                가격 *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                대출 가능 여부
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Y">대출 가능</option>
                                <option value="N">대출 불가</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {editingBook ? '수정' : '등록'}
                        </button>
                    </div>
                </form>
            </Model>

            {/* 도서 목록 테이블 */}
            <Table
                columns={columns}
                data={filteredBooks}
                actions={actions}
            />

            {/* 통계 정보 */}
            {books && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-blue-600 text-sm font-medium">총 도서</div>
                                <div className="text-2xl font-bold text-blue-900">{books.length}권</div>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-green-600 text-sm font-medium">대출가능</div>
                                <div className="text-2xl font-bold text-green-900">
                                    {books.filter(book => book.status === 'Y').length}권
                                </div>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-red-600 text-sm font-medium">대출불가</div>
                                <div className="text-2xl font-bold text-red-900">
                                    {books.filter(book => book.status === 'N').length}권
                                </div>
                            </div>
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-purple-600 text-sm font-medium">검색결과</div>
                                <div className="text-2xl font-bold text-purple-900">{filteredBooks.length}권</div>
                            </div>
                            <Search className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* 검색 결과가 없을 때 */}
            {filteredBooks.length === 0 && books && books.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>검색 조건에 맞는 도서가 없습니다.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                        }}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                        검색 조건 초기화
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookManagement;