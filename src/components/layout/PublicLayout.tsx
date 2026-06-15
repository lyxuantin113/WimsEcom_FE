import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const { Content } = Layout;

const PublicLayout: React.FC = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <PublicHeader />

            <Content style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                <div className="animate-fade-up" style={{ background: '#fff', minHeight: 'calc(100vh - 250px)' }}>
                    <Outlet />
                </div>
            </Content>

            <PublicFooter />
        </Layout>
    );
};

export default PublicLayout;