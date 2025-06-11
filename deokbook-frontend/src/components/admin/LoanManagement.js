// src/components/admin/LoanManagement.js
import React, { useState } from 'react';
import { Plus, CheckCircle, Calendar, AlertTriangle, User, Book, Clock, RefreshCw } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { loanService } from '../../services/loanService';
import { userService } from '../../services/userService';
import { bookService } from '../../services/bookService';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import Model from '../common/Model';
import Table from '../common/Table';

const LoanManagement = () => {
    const [showLoanForm, setShowLoanForm] = useState(false);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loanData, setLoanData] = useState({ userId: '', bookId: '' });
    const [returnData, setReturnData] = useState({ userId: '', bookId: '' });

    // API 호출들
    const { data: loans, loading: loansLoading, error: loansError, refetch: refetchLoans } = useApi(
        () => loanService.getLoans(),
        []
    );

    const { data: users, loading: usersLoading } = useApi(
        () => userService.getUsers(),
        []
    );

    const { data: allBooks, loading: booksLoading } = useApi(
        () => bookService.getBooks(),
        []
    );

    // 대출 가능한 도서들 (상태가 'Y'인 도서)
    const availableBooks = React.useMemo(() => {
        return allBooks?.filter(book => book.status === 'Y') || [];
    }, [allBooks]);

    // 필터링된 대출 목록
    const filteredLoans = React.useMemo(() => {
        if (!loans) return [];

        return loans.filter(loan => {
            switch (statusFilter) {
                case 'active':
                    return !loan.returnDate;
                case 'returned':
                    return loan.returnDate;
                case 'overdue':
                    return !loan.returnDate && isOverdue(loan.dueDate);
                default:
                    return true;
            }
        });
    }, [loans, statusFilter]);

    // 대출 처리
    const handleLoan = async (e) => {
        e.preventDefault();
        try {
            await loanService.loanBook(loanData.userId, loanData.bookId);
            await refetchLoans();
            setLoanData({ userId: '', bookId: '' });
            setShowLoanForm(false);
            alert('대출 처리가 완료되었습니다.');
        } catch (err) {
            console.error('대출 처리 실패:', err);
            alert('대출 처리에 실패했습니다: ' + err.message);
        }
    };

    // 반납 처리
    const handleReturn = async (loan) => {
        if (window.confirm(`"${loan.book?.title}" 도서를 반납 처리하시겠습니까?`)) {
            try {
                await loanService.returnBook(loan.user.id, loan.book.id);
                await refetchLoans();
                alert('반납 처리가 완료되었습니다.');
            } catch (err) {
                console.error('반납 처리 실패:', err);
                alert('반납 처리에 실패했습니다: ' + err.message);
            }
        }
    };

    // 개별 반납 처리 (모달 사용)
    const handleReturnWithForm = async (e) => {
        e.preventDefault();
        try {
            await loanService.returnBook(returnData.userId, returnData.bookId);
            await refetchLoans();
            setReturnData({ userId: '', bookId: '' });
            setShowReturnForm(false);
            alert('반납 처리가 완료되었습니다.');
        } catch (err) {
            console.error('반납 처리 실패:', err);
            alert('반납 처리에 실패했습니다: ' + err.message);
        }
    };

    // 대출자별 현재 대출 도서 가져오기
    const getUserActiveLoans = (userId) => {
        return loans?.filter(loan =>
            loan.user.id === parseInt(userId) && !loan.returnDate
        ) || [];
    };

    // 테이블 컬럼 정의
    const columns = [
        { key: 'id', header: '대출ID' },
        {
            key: 'user',
            header: '대출자',
            render: (user) => (
                <div className="flex items-center">
                    <User size={16} className="mr-2 text-gray-400" />
                    <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'book',
            header: '도서',
            render: (book) => (
                <div className="flex items-center">
                    <Book size={16} className="mr-2 text-gray-400" />
                    <div className="max-w-xs">
                        <div className="font-medium truncate" title={book?.title}>
                            {book?.title}
                        </div>
                        <div className="text-sm text-gray-500">{book?.author}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'loanDate',
            header: '대출일',
            render: (date) => (
                <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-gray-400" />
                    {formatDate(date)}
                </div>
            )
        },
        {
            key: 'dueDate',
            header: '반납예정일',
            render: (date, loan) => (
                <div className={`flex items-center ${
                    !loan.returnDate && isOverdue(date) ? 'text-red-600 font-semibold' : ''
                }`}>
                    <Clock size={14} className="mr-1" />
                    {formatDate(date)}
                    {!loan.returnDate && isOverdue(date) && (
                        <AlertTriangle size={14} className="ml-1 text-red-500" />
                    )}
                </div>
            )
        },
        {
            key: 'returnDate',
            header: '반납일',
            render: (date) => date ? (
                <div className="flex items-center text-green-600">
                    <CheckCircle size={14} className="mr-1" />
                    {formatDate(date)}
                </div>
            ) : (
                <span className="text-gray-400">-</span>
            )
        },
        {
            key: 'status',
            header: '상태',
            render: (_, loan) => {
                if (loan.returnDate) {
                    return (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              반납완료
            </span>
                    );
                } else if (isOverdue(loan.dueDate)) {
                    const overdueDays = Math.ceil((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
                    return (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              연체 ({overdueDays}일)
            </span>
                    );
                } else {
                    const remainingDays = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              대출중 ({remainingDays}일 남음)
            </span>
                    );
                }
            }
        }
    ];

    // 테이블 액션 정의
    const actions = [
        {
            icon: <CheckCircle size={16} />,
            onClick: handleReturn,
            className: 'text-green-600 hover:text-green-800',
            title: '반납',
            condition: (loan) => !loan.returnDate // 반납되지 않은 대출만 표시
        }
    ].filter(action => !action.condition || action.condition);

    const loading = loansLoading || usersLoading || booksLoading;
    const error = loansError;

    if (loading) return <LoadingSpinner text="대출 정보를 불러오는 중..." />;
    if (error) return <div className="text-red-600">오류: {error}</div>;

    // 통계 계산
    const stats = {
        total: loans?.length || 0,
        active: loans?.filter(loan => !loan.returnDate).length || 0,
        overdue: loans?.filter(loan => !loan.returnDate && isOverdue(loan.dueDate)).length || 0,
        returned: loans?.filter(loan => loan.returnDate).length || 0
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">대출/반납 관리</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowReturnForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
                    >
                        <CheckCircle size={16} />
                        반납 처리
                    </button>
                    <button
                        onClick={() => setShowLoanForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={16} />
                        대출 처리
                    </button>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-blue-600 text-sm font-medium">총 대출</div>
                            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        </div>
                        <Book className="h-8 w-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-orange-600 text-sm font-medium">대출중</div>
                            <div className="text-2xl font-bold text-orange-900">{stats.active}</div>
                        </div>
                        <Clock className="h-8 w-8 text-orange-400" />
                    </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-red-600 text-sm font-medium">연체</div>
                            <div className="text-2xl font-bold text-red-900">{stats.overdue}</div>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-green-600 text-sm font-medium">반납완료</div>
                            <div className="text-2xl font-bold text-green-900">{stats.returned}</div>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* 필터 */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">상태별 필터:</span>
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: '전체', count: stats.total },
                            { value: 'active', label: '대출중', count: stats.active },
                            { value: 'overdue', label: '연체', count: stats.overdue },
                            { value: 'returned', label: '반납완료', count: stats.returned }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                    statusFilter === filter.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={refetchLoans}
                        className="ml-auto p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="새로고침"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* 대출 처리 모달 */}
            <Model
                isOpen={showLoanForm}
                onClose={() => {
                    setShowLoanForm(false);
                    setLoanData({ userId: '', bookId: '' });
                }}
                title="도서 대출 처리"
                size="medium"
            >
                <form onSubmit={handleLoan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            대출자 선택 *
                        </label>
                        <select
                            value={loanData.userId}
                            onChange={(e) => setLoanData({ ...loanData, userId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">대출자를 선택하세요</option>
                            {users?.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                    {user.userMemo && ` - ${user.userMemo}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            도서 선택 *
                        </label>
                        <select
                            value={loanData.bookId}
                            onChange={(e) => setLoanData({ ...loanData, bookId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">대출할 도서를 선택하세요</option>
                            {availableBooks.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} - {book.author} ({book.publisher})
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            대출 가능한 도서만 표시됩니다. (총 {availableBooks.length}권)
                        </p>
                    </div>

                    {/* 선택된 사용자의 현재 대출 목록 */}
                    {loanData.userId && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                현재 대출 중인 도서
                            </h4>
                            {getUserActiveLoans(loanData.userId).length > 0 ? (
                                <ul className="text-sm text-yellow-700">
                                    {getUserActiveLoans(loanData.userId).map(loan => (
                                        <li key={loan.id} className="flex justify-between">
                                            <span>{loan.book.title}</span>
                                            <span className={isOverdue(loan.dueDate) ? 'text-red-600 font-semibold' : ''}>
                        {isOverdue(loan.dueDate) ? '연체중' : `~${formatDate(loan.dueDate)}`}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-yellow-700">현재 대출 중인 도서가 없습니다.</p>
                            )}
                        </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>대출 기간:</strong> 15일 (반납 예정일: {
                            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')
                        })
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowLoanForm(false);
                                setLoanData({ userId: '', bookId: '' });
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            대출 처리
                        </button>
                    </div>
                </form>
            </Model>

            {/* 반납 처리 모달 */}
            <Model
                isOpen={showReturnForm}
                onClose={() => {
                    setShowReturnForm(false);
                    setReturnData({ userId: '', bookId: '' });
                }}
                title="도서 반납 처리"
                size="medium"
            >
                <form onSubmit={handleReturnWithForm} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            반납자 선택 *
                        </label>
                        <select
                            value={returnData.userId}
                            onChange={(e) => setReturnData({ ...returnData, userId: e.target.value, bookId: '' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        >
                            <option value="">반납자를 선택하세요</option>
                            {users?.filter(user =>
                                loans?.some(loan => loan.user.id === user.id && !loan.returnDate)
                            ).map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {returnData.userId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                반납할 도서 선택 *
                            </label>
                            <select
                                value={returnData.bookId}
                                onChange={(e) => setReturnData({ ...returnData, bookId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">반납할 도서를 선택하세요</option>
                                {getUserActiveLoans(returnData.userId).map(loan => (
                                    <option key={loan.id} value={loan.book.id}>
                                        {loan.book.title} - {loan.book.author}
                                        {isOverdue(loan.dueDate) && ' (연체중)'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowReturnForm(false);
                                setReturnData({ userId: '', bookId: '' });
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            반납 처리
                        </button>
                    </div>
                </form>
            </Model>

            {/* 대출 목록 테이블 */}
            <Table
                columns={columns}
                data={filteredLoans}
                actions={actions.map(action => ({
                    ...action,
                    condition: undefined // Table 컴포넌트에서는 condition 제거
                })).filter(action =>
                    filteredLoans.some(loan => !action.condition || action.condition(loan))
                )}
            />

            {/* 검색 결과가 없을 때 */}
            {filteredLoans.length === 0 && loans && loans.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>선택한 조건에 맞는 대출 기록이 없습니다.</p>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                        전체 보기
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoanManagement;