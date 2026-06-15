import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Input,
    Upload, InputNumber, Switch, message, Popconfirm, Tag, Space, Image, Typography
} from 'antd';
import {
    PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import bannerApi from '../../api/bannerApi';
import type { BannerResponse } from '../../types/backend';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

import BannerGallery from '../../components/home/BannerGallery';

const { Text } = Typography;

const BannerPage: React.FC = () => {
    const [data, setData] = useState<BannerResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);

    // State cho Upload ảnh
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Filter Active Banner
    const [filterActive, setFilterActive] = useState(false);

    const [form] = Form.useForm();

    // 1. Hàm load dữ liệu
    const fetchBanners = async () => {
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
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // 2. Xử lý mở Modal (Thêm hoặc Sửa)
    const handleOpenModal = (record?: BannerResponse) => {
        if (record) {
            // --- CHẾ ĐỘ SỬA ---
            setEditingBanner(record);
            form.setFieldsValue({
                linkUrl: record.linkUrl,
                priority: record.priority,
                active: record.active
            });
            // Hiển thị ảnh cũ để preview
            setPreviewImage(record.imageUrl);
            setFileList([]); // Reset file list mới
        } else {
            // --- CHẾ ĐỘ THÊM MỚI ---
            setEditingBanner(null);
            setPreviewImage('');
            form.resetFields();
            form.setFieldValue('active', true); // Mặc định là hiện
            form.setFieldValue('priority', 1);
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý Submit Form (Quan trọng: FormData)
    const handleFinish = async (values: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('linkUrl', values.linkUrl || '');
            formData.append('priority', values.priority.toString());
            formData.append('active', values.active);

            // Kiểm tra xem có file ảnh mới được chọn không
            if (fileList.length > 0) {
                const fileToUpload = fileList[0].originFileObj || fileList[0];
                formData.append('file', fileToUpload as Blob);
            } else if (!editingBanner) {
                // Nếu thêm mới mà không có ảnh -> Báo lỗi
                message.error("Vui lòng chọn hình ảnh!");
                setIsSubmitting(false);
                return;
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
                fetchBanners(); // Reload lại bảng
            } else {
                message.error("Thao tác thất bại");
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi hệ thống");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 4. Xử lý xóa
    const handleDelete = async (id: number) => {
        try {
            const res = await bannerApi.delete(id);
            if (res.code === 1000) {
                message.success("Đã xóa banner");
                fetchBanners();
            }
        } catch (error) {
            message.error("Không thể xóa banner này");
        }
    };

    // Cấu hình cột bảng
    const columns: ColumnsType<BannerResponse> = [
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
                        onClick={() => handleOpenModal(record)}
                    />
                    <Popconfirm
                        title="Xóa banner này?"
                        description="Hành động này không thể hoàn tác"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredData = filterActive ? data.filter(banner => banner.active) : data;

    // Cấu hình Upload
    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            setPreviewImage('');
        },
        beforeUpload: (file: UploadFile) => {
            // Không upload ngay mà lưu vào state để submit sau
            setFileList([file]);
            // Tạo preview url local
            setPreviewImage(URL.createObjectURL(file as any));
            return false;
        },
        fileList,
    };

    return (
        <div>
            {/* Live Preview Section */}
            <Card title="Live Preview (Giao diện hiển thị trang chủ)" style={{ marginBottom: 24 }}>
                <BannerGallery banners={filteredData.filter(b => b.active).sort((a, b) => (a.priority || 0) - (b.priority || 0))} />
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
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            {/* --- MODAL FORM --- */}
            <Modal
                title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null} // Tắt footer mặc định để dùng nút trong Form
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    {/* 1. Upload Ảnh */}
                    <Form.Item label="Hình ảnh (Banner)">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Khu vực hiển thị ảnh preview */}
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', border: '1px dashed #d9d9d9', padding: 5 }}
                                />
                            )}

                            <Upload {...uploadProps} maxCount={1} listType="picture">
                                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                            </Upload>
                        </div>
                    </Form.Item>

                    {/* 2. Link Url */}
                    <Form.Item
                        label="Link đích (Khi bấm vào ảnh)"
                        name="linkUrl"
                        rules={[{ required: true, message: 'Vui lòng nhập link đích' }]}
                    >
                        <Input placeholder="Ví dụ: /products/iphone-15" />
                    </Form.Item>

                    {/* 3. Priority & Active */}
                    <div style={{ display: 'flex', gap: 20 }}>
                        <Form.Item
                            label="Thứ tự ưu tiên"
                            name="priority"
                            initialValue={1}
                        >
                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="active"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                        </Form.Item>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: 10 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            {editingBanner ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BannerPage;