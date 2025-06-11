import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserDashboard from '../components/user/UserDashboard';

const UserPage = () => {
    return (
        <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/*" element={<UserDashboard />} />
        </Routes>
    );
};

export default UserPage;