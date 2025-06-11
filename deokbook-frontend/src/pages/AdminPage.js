import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/*" element={<AdminDashboard />} />
        </Routes>
    );
};

export default AdminPage;