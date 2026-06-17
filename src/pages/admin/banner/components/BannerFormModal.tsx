import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { BannerResponse } from '../../../../types/backend';

interface BannerFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<boolean>;
    isSubmitting: boolean;
    editingBanner: BannerResponse | null;
    form: any;
    fileList: UploadFile[];
    setFileList: (list: UploadFile[]) => void;
    previewImage: string;
    setPreviewImage: (url: string) => void;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    isSubmitting,
    editingBanner,
    form,
    fileList,
    setFileList,
    previewImage,
    setPreviewImage
}) => {
    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            setPreviewImage('');
        },
        beforeUpload: (file: UploadFile) => {
            setFileList([file]);
            setPreviewImage(URL.createObjectURL(file as any));
            return false;
        },
        fileList,
    };

    return (
        <Modal
            title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item label="Hình ảnh (Banner)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

                <Form.Item
                    label="Link đích (Khi bấm vào ảnh)"
                    name="linkUrl"
                    rules={[{ required: true, message: 'Vui lòng nhập link đích' }]}
                >
                    <Input placeholder="Ví dụ: /products/iphone-15" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 20 }}>
                    <Form.Item label="Thứ tự ưu tiên" name="priority" initialValue={1}>
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Trạng thái" name="active" valuePropName="checked">
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                </div>

                <div style={{ textAlign: 'right', marginTop: 10 }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        {editingBanner ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default React.memo(BannerFormModal);
