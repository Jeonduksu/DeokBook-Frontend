// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import MainPage from './pages/MainPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<MainPage />} />

                    {/* 로그인 페이지 */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* 관리자 페이지 - 보호된 라우트 */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 사용자 페이지 */}
                    <Route path="/user/*" element={<UserPage />} />

                    {/* 잘못된 경로 처리 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;