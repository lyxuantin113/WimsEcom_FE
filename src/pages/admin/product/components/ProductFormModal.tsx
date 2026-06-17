import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { CategoryResponse, ProductResponse } from '../../../../types/backend';

interface ProductFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    loading: boolean;
    editingProduct: ProductResponse | null;
    form: any;
    categories: CategoryResponse[];
    fileList: any[];
    setFileList: (list: any[]) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    loading,
    editingProduct,
    form,
    categories,
    fileList,
    setFileList
}) => {
    return (
        <Modal
            title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            open={visible}
            onOk={form.submit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="code" label="Mã SP" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Input placeholder="SP001" disabled={!!editingProduct} />
                    </Form.Item>
                    
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Select placeholder="Chọn danh mục">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <InputNumber style={{ width: '100%' }} formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Hình ảnh (Chọn để thay đổi)">
                    <Upload
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                    >
                        <Button icon={<UploadOutlined />}>
                            {editingProduct ? 'Đổi ảnh khác' : 'Chọn ảnh'}
                        </Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default React.memo(ProductFormModal);
