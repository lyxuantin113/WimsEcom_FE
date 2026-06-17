import React, { useEffect, useMemo } from 'react';
import { Card, Button, Switch, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useBanner } from '../hooks/useBanner';
import BannerGallery from '../../../components/home/BannerGallery';
import BannerTable from './components/BannerTable';
import BannerFormModal from './components/BannerFormModal';

const { Text } = Typography;

const BannerPage: React.FC = () => {
    const {
        data,
        loading,
        fetchBanners,
        isModalOpen,
        handleOpenModal,
        handleCloseModal,
        isSubmitting,
        editingBanner,
        form,
        submitBanner,
        deleteBanner,
        fileList,
        setFileList,
        previewImage,
        setPreviewImage,
        filterActive,
        setFilterActive
    } = useBanner();

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const filteredData = useMemo(() => {
        return filterActive ? data.filter(banner => banner.active) : data;
    }, [data, filterActive]);

    const activeBanners = useMemo(() => {
        return filteredData.filter(b => b.active).sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }, [filteredData]);

    return (
        <div>
            {/* Live Preview Section */}
            <Card title="Live Preview (Giao diện hiển thị trang chủ)" style={{ marginBottom: 24 }}>
                <BannerGallery banners={activeBanners} />
            </Card>

            <Card title="Quản lý Banner" extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm Banner
                </Button>
            }>
                <Text>Trạng thái: </Text>
                <Switch
                    checked={filterActive}
                    onChange={(checked) => setFilterActive(checked)}
                    checkedChildren="Hiển thị"
                    unCheckedChildren="Tất cả"
                />
                
                <BannerTable 
                    data={filteredData}
                    loading={loading}
                    onEdit={handleOpenModal}
                    onDelete={deleteBanner}
                />
            </Card>

            <BannerFormModal
                visible={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={submitBanner}
                isSubmitting={isSubmitting}
                editingBanner={editingBanner}
                form={form}
                fileList={fileList}
                setFileList={setFileList}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
            />
        </div>
    );
};

export default BannerPage;
