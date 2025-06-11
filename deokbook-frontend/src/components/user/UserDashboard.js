// src/components/user/UserDashboard.js
import React, { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, Book, CheckCircle, XCircle, Calendar, Grid, List } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { bookService } from '../../services/bookService';
import Layout from '../common/Layout';
import LoadingSpinner from '../common/LoadingSpinner';

const UserDashboard = () => {
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        title: '',
        author: '',
        publisher: ''
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'title',
        direction: 'asc'
    });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const itemsPerPage = 12;

    // API 호출 - 모든 도서 가져오기
    const { data: allBooks, loading, error, refetch } = useApi(
        () => bookService.getBooksForUser(),
        []
    );

    // 검색 및 필터링된 도서 목록
    const filteredAndSortedBooks = React.useMemo(() => {
        if (!allBooks) return [];

        let filtered = allBooks.filter(book => {
            // 키워드 검색 (제목, 저자, 출판사에서 검색)
            const keywordMatch = searchParams.keyword === '' ||
                book.title.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||
                book.author.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||
                book.publisher.toLowerCase().includes(searchParams.keyword.toLowerCase());

            // 개별 필드 검색
            const titleMatch = searchParams.title === '' ||
                book.title.toLowerCase().includes(searchParams.title.toLowerCase());

            const authorMatch = searchParams.author === '' ||
                book.author.toLowerCase().includes(searchParams.author.toLowerCase());

            const publisherMatch = searchParams.publisher === '' ||
                book.publisher.toLowerCase().includes(searchParams.publisher.toLowerCase());

            // 상태 필터
            const statusMatch = statusFilter === 'all' ||
                (statusFilter === 'available' && book.status === 'Y') ||
                (statusFilter === 'unavailable' && book.status === 'N');

            return keywordMatch && titleMatch && authorMatch && publisherMatch && statusMatch;
        });

        // 정렬
        filtered.sort((a, b) => {
            let aValue = a[sortConfig.field];
            let bValue = b[sortConfig.field];

            // 숫자 필드 처리
            if (sortConfig.field === 'price' || sortConfig.field === 'publishedDate') {
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            } else {
                aValue = aValue?.toString().toLowerCase() || '';
                bValue = bValue?.toString().toLowerCase() || '';
            }

            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [allBooks, searchParams, sortConfig, statusFilter]);

    // 페이지네이션
    const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage);
    const currentBooks = filteredAndSortedBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 검색 파라미터 변경
    const handleSearchChange = (field, value) => {
        setSearchParams(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1); // 검색 시 첫 페이지로
    };

    // 정렬 변경
    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    // 검색 초기화
    const resetSearch = () => {
        setSearchParams({ keyword: '', title: '', author: '', publisher: '' });
        setStatusFilter('all');
        setSortConfig({ field: 'title', direction: 'asc' });
        setCurrentPage(1);
    };

    if (loading) return <LoadingSpinner text="도서 목록을 불러오는 중..." />;
    if (error) return <div className="text-red-600">오류: {error}</div>;

    return (
        <Layout title="DeokBook 도서 검색">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">도서 검색</h1>
                    <p className="text-gray-600">원하는 도서를 검색하고 대출 가능 여부를 확인하세요</p>
                </div>

                {/* 검색 영역 */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    {/* 통합 검색 */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="제목, 저자, 출판사로 통합 검색..."
                                value={searchParams.keyword}
                                onChange={(e) => handleSearchChange('keyword', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>
                    </div>

                    {/* 상세 검색 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                placeholder="제목으로 검색"
                                value={searchParams.title}
                                onChange={(e) => handleSearchChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">저자</label>
                            <input
                                type="text"
                                placeholder="저자로 검색"
                                value={searchParams.author}
                                onChange={(e) => handleSearchChange('author', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">출판사</label>
                            <input
                                type="text"
                                placeholder="출판사로 검색"
                                value={searchParams.publisher}
                                onChange={(e) => handleSearchChange('publisher', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* 필터 및 정렬 옵션 */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* 상태 필터 */}
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">전체</option>
                                    <option value="available">대출가능</option>
                                    <option value="unavailable">대출불가</option>
                                </select>
                            </div>

                            {/* 정렬 옵션 */}
                            <div className="flex items-center gap-2">
                                {['title', 'author', 'publisher', 'publishedDate'].map((field) => (
                                    <button
                                        key={field}
                                        onClick={() => handleSort(field)}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                                            sortConfig.field === field
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {field === 'title' && '제목'}
                                        {field === 'author' && '저자'}
                                        {field === 'publisher' && '출판사'}
                                        {field === 'publishedDate' && '출간년도'}
                                        {sortConfig.field === field && (
                                            sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* 보기 모드 */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    title="격자 보기"
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${
                                        viewMode === 'list'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    title="목록 보기"
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            {/* 초기화 버튼 */}
                            <button
                                onClick={resetSearch}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                </div>

                {/* 검색 결과 정보 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-600">
                        총 <span className="font-semibold text-gray-900">{filteredAndSortedBooks.length}</span>권의 도서
                        {searchParams.keyword && (
                            <span> ('{searchParams.keyword}' 검색 결과)</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        {currentPage} / {totalPages} 페이지
                    </div>
                </div>

                {/* 도서 목록 */}
                {currentBooks.length > 0 ? (
                    viewMode === 'grid' ? <BookGrid books={currentBooks} /> : <BookList books={currentBooks} />
                ) : (
                    <NoResults onReset={resetSearch} />
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </Layout>
    );
};

// 격자 형태 도서 목록
const BookGrid = ({ books }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
                <BookCard key={book.id} book={book} />
            ))}
        </div>
    );
};

// 리스트 형태 도서 목록
const BookList = ({ books }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="divide-y divide-gray-200">
                {books.map((book) => (
                    <BookListItem key={book.id} book={book} />
                ))}
            </div>
        </div>
    );
};

// 도서 카드 컴포넌트
const BookCard = ({ book }) => {
    const isAvailable = book.status === 'Y';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* 도서 표지 영역 */}
            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                <Book className="h-16 w-16 text-blue-400" />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {isAvailable ? '대출가능' : '대출불가'}
                </div>
            </div>

            {/* 도서 정보 */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2" title={book.title}>
                    {book.title}
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                    <p><span className="font-medium">저자:</span> {book.author}</p>
                    <p><span className="font-medium">출판사:</span> {book.publisher}</p>
                    {book.publishedDate && (
                        <p><span className="font-medium">출간:</span> {book.publishedDate}년</p>
                    )}
                    {book.price && (
                        <p><span className="font-medium">가격:</span> {book.price.toLocaleString()}원</p>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                        {isAvailable ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-xs font-medium ${
                            isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
              {isAvailable ? '대출 가능' : '대출 불가'}
            </span>
                    </div>
                    <span className="text-xs text-gray-500">#{book.id}</span>
                </div>
            </div>
        </div>
    );
};

// 도서 리스트 아이템 컴포넌트
const BookListItem = ({ book }) => {
    const isAvailable = book.status === 'Y';

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded flex items-center justify-center">
                            <Book className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate" title={book.title}>
                                    {book.title}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                    <span><strong>저자:</strong> {book.author}</span>
                                    <span><strong>출판사:</strong> {book.publisher}</span>
                                    {book.publishedDate && (
                                        <span><strong>출간:</strong> {book.publishedDate}년</span>
                                    )}
                                    {book.price && (
                                        <span><strong>가격:</strong> {book.price.toLocaleString()}원</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-shrink-0 ml-4 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                  {isAvailable ? (
                      <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          대출가능
                      </>
                  ) : (
                      <>
                          <XCircle className="h-3 w-3 mr-1" />
                          대출불가
                      </>
                  )}
                </span>
                                <span className="ml-3 text-xs text-gray-500">#{book.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 검색 결과 없음 컴포넌트
const NoResults = ({ onReset }) => {
    return (
        <div className="text-center py-12">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">
                검색 조건을 변경하거나 다른 키워드로 다시 검색해보세요.
            </p>
            <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                검색 조건 초기화
            </button>
        </div>
    );
};

// 페이지네이션 컴포넌트
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // 보여줄 페이지 수
        const half = Math.floor(showPages / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + showPages - 1);

        if (end - start + 1 < showPages) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                이전
            </button>

            {getPageNumbers().map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                다음
            </button>
        </div>
    );
};

export default UserDashboard;