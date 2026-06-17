import React, { useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Tag, Image } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BannerResponse } from '../../../../types/backend';
import type { ColumnsType } from 'antd/es/table';

interface BannerTableProps {
    data: BannerResponse[];
    loading: boolean;
    onEdit: (record: BannerResponse) => void;
    onDelete: (id: number) => void;
}

export const BannerTable: React.FC<BannerTableProps> = ({
    data,
    loading,
    onEdit,
    onDelete
}) => {
    const columns: ColumnsType<BannerResponse> = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url: string) => (
                <Image src={url} alt="banner" width={120} style={{ borderRadius: 8, objectFit: 'cover' }} />
            ),
        },
        {
            title: 'Link đích',
            dataIndex: 'linkUrl',
            key: 'linkUrl',
            render: (text) => <a href={text} target="_blank" rel="noreferrer">{text}</a>
        },
        {
            title: 'Thứ tự',
            dataIndex: 'priority',
            key: 'priority',
            sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
            width: 100,
            align: 'center'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Hiển thị' : 'Ẩn'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        type="default"
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa banner này?"
                        description="Hành động này không thể hoàn tác"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ], [onEdit, onDelete]);

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
        />
    );
};

export default React.memo(BannerTable);
