// src/components/common/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 역할 기반 접근 제어가 필요한 경우
    if (requiredRole) {
        // JWT 토큰에서 역할 정보를 확인하는 로직 추가 필요
        // 현재는 인증된 사용자면 모두 허용
    }

    return children;
};

export default ProtectedRoute;