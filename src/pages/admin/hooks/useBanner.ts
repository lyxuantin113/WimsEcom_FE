import { useState, useCallback } from 'react';
import { message, Form } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import bannerApi from '../../../api/bannerApi';
import type { BannerResponse } from '../../../types/backend';

export const useBanner = () => {
    const [data, setData] = useState<BannerResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);
    const [form] = Form.useForm();

    // Upload State
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Filter State
    const [filterActive, setFilterActive] = useState(false);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const res = await bannerApi.getAll();
            if (res.code === 1000 && res.result) {
                setData(res.result);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách banner");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOpenModal = useCallback((record?: BannerResponse) => {
        if (record) {
            setEditingBanner(record);
            form.setFieldsValue({
                linkUrl: record.linkUrl,
                priority: record.priority,
                active: record.active
            });
            setPreviewImage(record.imageUrl);
            setFileList([]);
        } else {
            setEditingBanner(null);
            setPreviewImage('');
            form.resetFields();
            form.setFieldValue('active', true);
            form.setFieldValue('priority', 1);
            setFileList([]);
        }
        setIsModalOpen(true);
    }, [form]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const submitBanner = useCallback(async (values: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('linkUrl', values.linkUrl || '');
            formData.append('priority', values.priority.toString());
            formData.append('active', values.active);

            if (fileList.length > 0) {
                const fileToUpload = fileList[0].originFileObj || fileList[0];
                formData.append('file', fileToUpload as Blob);
            } else if (!editingBanner) {
                message.error("Vui lòng chọn hình ảnh!");
                setIsSubmitting(false);
                return false;
            }

            let res;
            if (editingBanner) {
                res = await bannerApi.update(editingBanner.id, formData);
            } else {
                res = await bannerApi.create(formData);
            }

            if (res && res.code === 1000) {
                message.success(editingBanner ? "Cập nhật thành công" : "Thêm mới thành công");
                setIsModalOpen(false);
                fetchBanners();
                return true;
            } else {
                message.error("Thao tác thất bại");
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi hệ thống");
        } finally {
            setIsSubmitting(false);
        }
        return false;
    }, [editingBanner, fileList, fetchBanners]);

    const deleteBanner = useCallback(async (id: number) => {
        try {
            const res = await bannerApi.delete(id);
            if (res.code === 1000) {
                message.success("Đã xóa banner");
                fetchBanners();
            }
        } catch (error) {
            message.error("Không thể xóa banner này");
        }
    }, [fetchBanners]);

    return {
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
    };
};
