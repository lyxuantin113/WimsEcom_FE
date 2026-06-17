import React, { useMemo } from 'react';
import { Drawer, Table, Tag, Typography } from 'antd';
import type { ProcurementResponse } from '../../../../api/procurementApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ProcurementDetailDrawerProps {
    visible: boolean;
    onClose: () => void;
    procurement: ProcurementResponse | null;
    loading: boolean;
}

export const ProcurementDetailDrawer: React.FC<ProcurementDetailDrawerProps> = ({
    visible,
    onClose,
    procurement,
    loading
}) => {

    const detailColumns = useMemo(() => [
        { title: 'Mã SP', dataIndex: 'productCode', key: 'productCode' },
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
        { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
        { 
            title: 'Đơn Giá', 
            dataIndex: 'unitPrice', 
            key: 'unitPrice',
            render: (val: number) => `${val?.toLocaleString()} ₫`
        },
        { 
            title: 'Thành Tiền', 
            dataIndex: 'subTotal', 
            key: 'subTotal',
            render: (val: number) => <Text strong>{val?.toLocaleString()} ₫</Text>
        },
    ], []);

    return (
        <Drawer
            title={`Chi Tiết Phiếu Nhập #${procurement?.id || ''}`}
            placement="right"
            width={700}
            onClose={onClose}
            open={visible}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>Loading...</div>
            ) : procurement ? (
                <div>
                    <div style={{ marginBottom: 20 }}>
                        <p><strong>Nhà cung cấp:</strong> {procurement.supplier?.name}</p>
                        <p><strong>Ghi chú:</strong> {procurement.note || 'Không có'}</p>
                        <p>
                            <strong>Trạng thái: </strong> 
                            <Tag color={procurement.status === 'APPROVED' ? 'success' : 'warning'}>
                                {procurement.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BẢN NHÁP'}
                            </Tag>
                        </p>
                        <p><strong>Ngày tạo:</strong> {dayjs(procurement.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        {procurement.status === 'APPROVED' && (
                            <>
                                <p><strong>Ngày duyệt:</strong> {dayjs(procurement.approvedAt).format('DD/MM/YYYY HH:mm')}</p>
                                <p><strong>Người duyệt:</strong> {procurement.approvedByUsername}</p>
                            </>
                        )}
                        <Title level={4} style={{ marginTop: 10, color: '#853d2c' }}>
                            Tổng Tiền: {procurement.totalAmount?.toLocaleString()} ₫
                        </Title>
                    </div>
                    
                    <Table 
                        columns={detailColumns} 
                        dataSource={procurement.items || []} 
                        rowKey="id" 
                        pagination={false}
                        bordered
                    />
                </div>
            ) : (
                <div>Không tìm thấy dữ liệu</div>
            )}
        </Drawer>
    );
};

export default React.memo(ProcurementDetailDrawer);
