import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSupplier } from '../hooks/useSupplier';
import CreateSupplierModal from './components/CreateSupplierModal';

const { Title } = Typography;

const SupplierPage: React.FC = () => {
    const { suppliers, loading, fetchSuppliers, createSupplier } = useSupplier();
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const columns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Tên Công Ty', dataIndex: 'name', key: 'name' },
        { title: 'Người Liên Hệ', dataIndex: 'contactName', key: 'contactName' },
        { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Địa Chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
    ], []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Nhà Cung Cấp</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Thêm Nhà Cung Cấp
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={suppliers}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CreateSupplierModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={createSupplier}
            />
        </div>
    );
};

export default SupplierPage;
