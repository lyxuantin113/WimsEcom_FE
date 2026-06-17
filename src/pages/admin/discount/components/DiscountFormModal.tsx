import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Button } from 'antd';
import type { Discount } from '../../../../types/backend';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DiscountFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    editingDiscount: Discount | null;
    form: any;
}

export const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    editingDiscount,
    form
}) => {
    return (
        <Modal
            title={editingDiscount ? "Cập nhật Voucher" : "Tạo Voucher Mới"}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label="Mã Voucher (Code)" name="code" rules={[{ required: true, message: 'Nhập mã (VD: SALE50)' }]}>
                        <Input placeholder="VD: SUMMER2025" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input placeholder="Mô tả ngắn gọn" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label="Loại giảm giá" name="type">
                        <Select>
                            <Option value="PERCENTAGE">Theo Phần trăm (%)</Option>
                            <Option value="FIXED_AMOUNT">Theo Tiền mặt (VND)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Giá trị giảm" name="value" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item label="Giảm tối đa (Cho loại %)" name="maxDiscountAmount">
                        <InputNumber style={{ width: '100%' }} placeholder="VD: 50,000" formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    
                    <Form.Item label="Đơn hàng tối thiểu" name="minOrderValue" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label="Phạm vi áp dụng" name="scope">
                        <Select>
                            <Option value="GLOBAL">Toàn sàn (Global)</Option>
                            <Option value="SPECIFIC_PRODUCT">Sản phẩm cụ thể</Option>
                            <Option value="SPECIFIC_CATEGORY">Danh mục cụ thể</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, current) => prev.scope !== current.scope}>
                        {({ getFieldValue }) => 
                            getFieldValue('scope') !== 'GLOBAL' && (
                                <Form.Item label="Danh sách ID (Cách nhau dấu phẩy)" name="applicableIds">
                                    <Input placeholder="VD: 1,2,5" />
                                </Form.Item>
                            )
                        }
                    </Form.Item>
                </div>

                <Form.Item label="Thời gian áp dụng" name="dateRange" rules={[{ required: true }]}>
                    <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                </Form.Item>

                <div style={{ display: 'flex', gap: 20 }}>
                    <Form.Item label="Giới hạn số lượng" name="usageLimit" initialValue={100}>
                        <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item label="Kích hoạt ngay" name="active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit">Lưu Voucher</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default React.memo(DiscountFormModal);
