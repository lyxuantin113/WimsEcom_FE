import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Space, Button, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Supplier } from '../../../../api/supplierApi';
import type { ProductResponse } from '../../../../types/backend';
import type { ProcurementRequest } from '../../../../api/procurementApi';

const { Option } = Select;

interface CreateProcurementModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (payload: ProcurementRequest) => Promise<boolean>;
    suppliers: Supplier[];
    products: ProductResponse[];
}

export const CreateProcurementModal: React.FC<CreateProcurementModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    suppliers,
    products
}) => {
    const [form] = Form.useForm();

    const handleFinish = async (values: any) => {
        if (!values.items || values.items.length === 0) {
            message.error("Vui lòng thêm ít nhất 1 sản phẩm vào phiếu nhập");
            return;
        }

        const payload: ProcurementRequest = {
            supplierId: values.supplierId,
            note: values.note,
            items: values.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        };

        const success = await onSubmit(payload);
        if (success) {
            form.resetFields();
        }
    };

    return (
        <Modal
            title="Tạo Phiếu Nhập Mới"
            open={visible}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            okText="Lưu Bản Nháp"
            cancelText="Hủy"
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="supplierId" label="Nhà Cung Cấp" rules={[{ required: true, message: 'Vui lòng chọn NCC' }]}>
                    <Select placeholder="Chọn nhà cung cấp" showSearch optionFilterProp="children">
                        {suppliers.map(s => (
                            <Option key={s.id} value={s.id}>{s.name} - {s.phone}</Option>
                        ))}
                    </Select>
                </Form.Item>
                
                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                </Form.Item>

                <Card size="small" title="Danh sách sản phẩm nhập" style={{ marginTop: 16 }}>
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'productId']}
                                            rules={[{ required: true, message: 'Chọn SP' }]}
                                            style={{ width: 300 }}
                                        >
                                            <Select placeholder="Sản phẩm" showSearch optionFilterProp="children">
                                                {products.map(p => (
                                                    <Option key={p.id} value={p.id}>[{p.code}] {p.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                            rules={[{ required: true, message: 'Nhập SL' }]}
                                        >
                                            <InputNumber placeholder="Số lượng" min={1} style={{ width: 120 }} />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'unitPrice']}
                                            rules={[{ required: true, message: 'Nhập Giá' }]}
                                        >
                                            <InputNumber 
                                                placeholder="Đơn giá nhập" 
                                                min={0} 
                                                style={{ width: 150 }} 
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        
                                        <Button danger onClick={() => remove(name)}>Xóa</Button>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm sản phẩm vào phiếu
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>
            </Form>
        </Modal>
    );
};

export default React.memo(CreateProcurementModal);
