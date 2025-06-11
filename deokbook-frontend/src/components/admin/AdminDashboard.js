// src/components/admin/AdminDashboard.js
import React, { useState } from 'react';
import { User, Book, Calendar, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { userService } from '../../services/userService';
import { bookService } from '../../services/bookService';
import { loanService } from '../../services/loanService';
import { isOverdue } from '../../utils/dateUtils';
import Layout from '../common/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import UserManagement from './UserManagement';
import BookManagement from './BookManagement';
import LoanManagement from './LoanManagement';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    // API 호출들 - 대시보드 통계용
    const { data: users } = useApi(() => userService.getUsers(), []);
    const { data: books } = useApi(() => bookService.getBooks(), []);
    const { data: loans } = useApi(() => loanService.getLoans(), []);

    // 통계 계산
    const stats = React.useMemo(() => {
        if (!users || !books || !loans) return null;

        const activeLoans = loans.filter(loan => !loan.returnDate);
        const overdueLoans = activeLoans.filter(loan => isOverdue(loan.dueDate));
        const availableBooks = books.filter(book => book.status === 'Y');

        // 최근 7일간 대출
        const recentLoans = loans.filter(loan => {
            const loanDate = new Date(loan.loanDate);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return loanDate >= weekAgo;
        });

        // 인기 도서 (대출 횟수 기준)
        const bookLoanCounts = {};
        loans.forEach(loan => {
            const bookId = loan.book.id;
            bookLoanCounts[bookId] = (bookLoanCounts[bookId] || 0) + 1;
        });

        const popularBooks = Object.entries(bookLoanCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([bookId, count]) => ({
                book: books.find(book => book.id === parseInt(bookId)),
                count
            }));

        // 활성 사용자 (현재 대출 중인 사용자)
        const activeUserIds = new Set(activeLoans.map(loan => loan.user.id));

        return {
            totalUsers: users.length,
            totalBooks: books.length,
            availableBooks: availableBooks.length,
            totalLoans: loans.length,
            activeLoans: activeLoans.length,
            overdueLoans: overdueLoans.length,
            recentLoans: recentLoans.length,
            popularBooks,
            activeUsers: activeUserIds.size,
            returnedToday: loans.filter(loan => {
                if (!loan.returnDate) return false;
                const today = new Date().toDateString();
                return new Date(loan.returnDate).toDateString() === today;
            }).length
        };
    }, [users, books, loans]);

    const tabs = [
        { id: 'dashboard', label: '대시보드', icon: BarChart3 },
        { id: 'users', label: '사용자 관리', icon: User },
        { id: 'books', label: '도서 관리', icon: Book },
        { id: 'loans', label: '대출/반납', icon: Calendar }
    ];

    return (
        <Layout title="DeokBook 관리자">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* 탭 콘텐츠 */}
                <div>
                    {activeTab === 'dashboard' && <DashboardContent stats={stats} setActiveTab={setActiveTab} />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'books' && <BookManagement />}
                    {activeTab === 'loans' && <LoanManagement />}
                </div>
            </div>
        </Layout>
    );
};

// 대시보드 메인 콘텐츠 컴포넌트
const DashboardContent = ({ stats, setActiveTab }) => {
    if (!stats) {
        return <LoadingSpinner text="대시보드 데이터를 불러오는 중..." />;
    }

    return (
        <div className="space-y-8">
            {/* 메인 통계 카드 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">시스템 현황</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="총 사용자"
                        value={stats.totalUsers}
                        icon={User}
                        color="blue"
                        subtitle={`활성 사용자 ${stats.activeUsers}명`}
                    />
                    <StatCard
                        title="총 도서"
                        value={stats.totalBooks}
                        icon={Book}
                        color="green"
                        subtitle={`대출가능 ${stats.availableBooks}권`}
                    />
                    <StatCard
                        title="현재 대출"
                        value={stats.activeLoans}
                        icon={Calendar}
                        color="orange"
                        subtitle={`총 대출 ${stats.totalLoans}건`}
                    />
                    <StatCard
                        title="연체 도서"
                        value={stats.overdueLoans}
                        icon={AlertTriangle}
                        color="red"
                        subtitle="즉시 처리 필요"
                        urgent={stats.overdueLoans > 0}
                    />
                </div>
            </div>

            {/* 최근 활동 및 알림 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 최근 활동 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        <ActivityItem
                            icon={Calendar}
                            color="blue"
                            title="최근 7일 대출"
                            value={`${stats.recentLoans}건`}
                            description="지난주 대비"
                        />
                        <ActivityItem
                            icon={CheckCircle}
                            color="green"
                            title="오늘 반납"
                            value={`${stats.returnedToday}건`}
                            description="정상 반납"
                        />
                        <ActivityItem
                            icon={Clock}
                            color="orange"
                            title="대출중"
                            value={`${stats.activeLoans}건`}
                            description="현재 진행중"
                        />
                    </div>
                </div>

                {/* 인기 도서 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">인기 도서</h3>
                        <Book className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {stats.popularBooks.length > 0 ? (
                            stats.popularBooks.map((item, index) => (
                                <div key={item.book.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.book.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.book.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.count}회
                    </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                아직 대출 기록이 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 연체 경고 */}
            {stats.overdueLoans > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-red-800">
                                연체 도서 알림
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                현재 <strong>{stats.overdueLoans}건</strong>의 연체 도서가 있습니다.
                                대출/반납 관리에서 확인하고 처리해주세요.
                            </p>
                            <div className="mt-3">
                                <button
                                    onClick={() => window.location.hash = '#loans'}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 transition-colors"
                                >
                                    연체 도서 확인하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 빠른 작업 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionCard
                        title="새 사용자 등록"
                        description="새로운 도서관 이용자를 등록합니다"
                        icon={User}
                        color="blue"
                        onClick={() => setActiveTab('users')}
                    />
                    <QuickActionCard
                        title="도서 등록"
                        description="새로운 도서를 시스템에 등록합니다"
                        icon={Book}
                        color="green"
                        onClick={() => setActiveTab('books')}
                    />
                    <QuickActionCard
                        title="대출 처리"
                        description="도서 대출 및 반납을 처리합니다"
                        icon={Calendar}
                        color="orange"
                        onClick={() => setActiveTab('loans')}
                    />
                </div>
            </div>
        </div>
    );
};

// 통계 카드 컴포넌트
const StatCard = ({ title, value, icon: Icon, color, subtitle, urgent = false }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600'
    };

    const textColorClasses = {
        blue: 'text-blue-900',
        green: 'text-green-900',
        orange: 'text-orange-900',
        red: 'text-red-900'
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${urgent ? 'ring-2 ring-red-200' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-3xl font-bold ${textColorClasses[color]}`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {urgent && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    긴급 처리 필요
                </div>
            )}
        </div>
    );
};

// 활동 아이템 컴포넌트
const ActivityItem = ({ icon: Icon, color, title, value, description }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100',
        green: 'text-green-600 bg-green-100',
        orange: 'text-orange-600 bg-orange-100',
        red: 'text-red-600 bg-red-100'
    };

    return (
        <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${colorClasses[color]}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

// 빠른 작업 카드 컴포넌트
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => {
    const colorClasses = {
        blue: 'text-blue-600 group-hover:text-blue-700',
        green: 'text-green-600 group-hover:text-green-700',
        orange: 'text-orange-600 group-hover:text-orange-700'
    };

    return (
        <button
            onClick={onClick}
            className="group text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
        >
            <div className="flex items-center space-x-3">
                <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default AdminDashboard;