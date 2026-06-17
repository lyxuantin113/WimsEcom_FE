import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, Typography, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Hooks
import { useProcurement } from '../hooks/useProcurement';

// Components
import ProcurementTable from './components/ProcurementTable';
import CreateProcurementModal from './components/CreateProcurementModal';
import ProcurementDetailDrawer from './components/ProcurementDetailDrawer';

const { Title } = Typography;

const ProcurementPage: React.FC = () => {
    // Custom hook xử lý toàn bộ logic và state
    const {
        procurements,
        loading,
        total,
        currentPage,
        pageSize,
        fetchProcurements,
        suppliers,
        products,
        fetchDropdownData,
        createDraft,
        approveProcurement,
        selectedProcurement,
        detailLoading,
        fetchProcurementDetails,
        setSelectedProcurement
    } = useProcurement();

    // UI States (chỉ liên quan tới ẩn/hiện Modal)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchProcurements(1);
        fetchDropdownData();
    }, [fetchProcurements, fetchDropdownData]);

    // Xử lý Duyệt phiếu
    const handleApproveConfirm = useCallback((id: number) => {
        Modal.confirm({
            title: 'Xác nhận duyệt phiếu nhập',
            content: 'Sau khi duyệt, số lượng tồn kho của các sản phẩm sẽ được tự động cộng thêm. Thao tác này không thể hoàn tác.',
            okText: 'Duyệt',
            cancelText: 'Hủy',
            onOk: () => approveProcurement(id)
        });
    }, [approveProcurement]);

    // Xử lý mở Drawer
    const handleOpenDetail = useCallback(async (id: number) => {
        setIsDrawerVisible(true);
        await fetchProcurementDetails(id);
    }, [fetchProcurementDetails]);

    // Xử lý đóng Drawer
    const handleCloseDetail = useCallback(() => {
        setIsDrawerVisible(false);
        setSelectedProcurement(null);
    }, [setSelectedProcurement]);

    return (
        <div>
            {/* 1. Header & Nút thêm mới */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Phiếu Nhập Kho</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Tạo Phiếu Nhập (Nháp)
                </Button>
            </div>

            {/* 2. Bảng hiển thị danh sách */}
            <Card>
                <ProcurementTable
                    procurements={procurements}
                    loading={loading}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={fetchProcurements}
                    onApprove={handleApproveConfirm}
                    onViewDetail={handleOpenDetail}
                />
            </Card>

            {/* 3. Modal Tạo Phiếu Nhập */}
            <CreateProcurementModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={async (payload) => {
                    const success = await createDraft(payload);
                    if (success) setIsModalVisible(false);
                    return success;
                }}
                suppliers={suppliers}
                products={products}
            />

            {/* 4. Drawer Chi tiết Phiếu Nhập */}
            <ProcurementDetailDrawer
                visible={isDrawerVisible}
                onClose={handleCloseDetail}
                procurement={selectedProcurement}
                loading={detailLoading}
            />
        </div>
    );
};

export default ProcurementPage;
