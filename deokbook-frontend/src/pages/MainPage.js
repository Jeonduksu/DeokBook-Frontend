import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Users, Settings } from 'lucide-react';
import Layout from '../components/common/Layout';

const MainPage = () => {
    return (
        <Layout showHeader={false}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="mb-8">
                        <Book className="h-20 w-20 text-blue-600 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">DeokBook</h1>
                        <p className="text-xl text-gray-600">미니 도서관 관리 시스템</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        {/* 관리자 로그인 */}
                        <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">관리자</h2>
                            <p className="text-gray-600 mb-6">
                                사용자 관리, 도서 관리, 대출/반납 처리
                            </p>
                            <Link
                                to="/login?type=admin"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                관리자 로그인
                            </Link>
                        </div>

                        {/* 사용자 기능 */}
                        <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">사용자</h2>
                            <p className="text-gray-600 mb-6">
                                도서 검색, 대출 가능 여부 확인
                            </p>
                            <Link
                                to="/user"
                                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                도서 검색
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 text-sm text-gray-500">
                        <p>기관 소속원만 사용할 수 있는 서비스입니다.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MainPage;