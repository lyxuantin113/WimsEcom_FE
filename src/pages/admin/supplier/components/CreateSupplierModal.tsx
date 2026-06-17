import React from 'react';
import { Modal, Form, Input } from 'antd';
import type { Supplier } from '../../../../api/supplierApi';

interface CreateSupplierModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Supplier) => Promise<boolean>;
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
    visible,
    onCancel,
    onSubmit
}) => {
    const [form] = Form.useForm();

    const handleFinish = async (values: Supplier) => {
        const success = await onSubmit(values);
        if (success) {
            form.resetFields();
            onCancel();
        }
    };

    return (
        <Modal
            title="Thêm Nhà Cung Cấp Mới"
            open={visible}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            okText="Thêm mới"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="name" label="Tên Công Ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                    <Input placeholder="Ví dụ: Công ty TNHH WIMS" />
                </Form.Item>
                <Form.Item name="contactName" label="Người Liên Hệ">
                    <Input placeholder="Tên người đại diện" />
                </Form.Item>
                <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input placeholder="0912345678" />
                </Form.Item>
                <Form.Item name="email" label="Email">
                    <Input placeholder="email@congty.com" type="email" />
                </Form.Item>
                <Form.Item name="address" label="Địa Chỉ">
                    <Input.TextArea rows={2} placeholder="Địa chỉ chi tiết" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default React.memo(CreateSupplierModal);
