import React, { useMemo } from 'react';
import { Table, Button, Space, Tag, Typography } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ProcurementResponse } from '../../../../api/procurementApi';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ProcurementTableProps {
    procurements: ProcurementResponse[];
    loading: boolean;
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onApprove: (id: number) => void;
    onViewDetail: (id: number) => void;
}

export const ProcurementTable: React.FC<ProcurementTableProps> = ({
    procurements,
    loading,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onApprove,
    onViewDetail
}) => {
    // Memoize columns to prevent unnecessary re-creations
    const columns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Nhà Cung Cấp', 
            key: 'supplier', 
            render: (_: any, record: ProcurementResponse) => record.supplier?.name 
        },
        { 
            title: 'Ngày Tạo', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm')
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (val: number) => <Text strong>{val?.toLocaleString()} ₫</Text>
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'APPROVED' ? 'success' : 'warning'}>
                    {status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BẢN NHÁP'}
                </Tag>
            )
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: any, record: ProcurementResponse) => (
                <Space size="middle">
                    <Button type="default" icon={<EyeOutlined />} onClick={() => onViewDetail(record.id)} />
                    {record.status === 'DRAFT' && (
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => onApprove(record.id)}>
                            Duyệt
                        </Button>
                    )}
                </Space>
            )
        }
    ], [onApprove, onViewDetail]);

    return (
        <Table 
            columns={columns} 
            dataSource={procurements} 
            rowKey="id" 
            loading={loading}
            pagination={{ 
                current: currentPage, 
                pageSize: pageSize, 
                total: total,
                onChange: onPageChange
            }}
        />
    );
};

// React.memo ensures it only re-renders when props change
export default React.memo(ProcurementTable);
