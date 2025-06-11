import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [searchParams] = useSearchParams();
    const { login, loading, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const isAdmin = searchParams.get('type') === 'admin';

    useEffect(() => {
        if (isAuthenticated) {
            // 이미 로그인된 경우 적절한 페이지로 리다이렉트
            navigate(isAdmin ? '/admin' : '/user');
        }
    }, [isAuthenticated, navigate, isAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(credentials);
            navigate(isAdmin ? '/admin' : '/user');
        } catch (err) {
            console.error('로그인 실패:', err);
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Layout showHeader={false}>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        {isAdmin ? '관리자 로그인' : '사용자 로그인'}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                이메일
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <LoadingSpinner size="small" text="" /> : '로그인'}
                        </button>
                    </form>

                    {isAdmin && (
                        <div className="mt-4 text-sm text-gray-600 text-center">
                            <p>테스트 계정: aaa@naver.com / 1234</p>
                        </div>
                    )}

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                            메인으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LoginPage;
