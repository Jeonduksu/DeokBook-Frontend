// src/components/common/Layout.js
import React from 'react';
import Header from './Header';

const Layout = ({ children, showHeader = true, title = "DeokBook" }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {showHeader && <Header title={title} />}
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;