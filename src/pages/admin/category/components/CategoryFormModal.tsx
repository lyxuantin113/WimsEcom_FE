import React from 'react';
import { Modal, Form, Input } from 'antd';
import type { CategoryResponse } from '../../../../types/backend';

interface CategoryFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    loading: boolean;
    editingCategory: CategoryResponse | null;
    form: any;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    loading,
    editingCategory,
    form
}) => {
    return (
        <Modal
            title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            open={visible}
            onOk={form.submit}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <Form.Item 
                    name="name" 
                    label="Tên danh mục" 
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input placeholder="Ví dụ: Laptop, Điện thoại..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default React.memo(CategoryFormModal);
