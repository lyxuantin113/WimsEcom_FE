import React, { useEffect, useState } from 'react';
import { 
    Card, Table, Button, Modal, Form, Input, InputNumber, 
    Select, DatePicker, Switch, Tag, message, Space, Popconfirm, Tooltip 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import discountApi from '../../api/discountApi';
import type { Discount } from '../../types/backend';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DiscountPage: React.FC = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [form] = Form.useForm();

    // 1. Fetch dữ liệu
    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const res = await discountApi.getAll();
            if (res.code === 1000 && res.result) setDiscounts(res.result);
        } catch (error) {
            message.error("Lỗi tải danh sách mã giảm giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDiscounts(); }, []);

    // 2. Xử lý Modal
    const handleOpenModal = (record?: Discount) => {
        if (record) {
            setEditingDiscount(record);
            form.setFieldsValue({
                ...record,
                // Chuyển chuỗi ISO sang dayjs object cho RangePicker
                dateRange: [dayjs(record.startDate), dayjs(record.endDate)], 
            });
        } else {
            setEditingDiscount(null);
            form.resetFields();
            form.setFieldsValue({
                active: true,
                scope: 'GLOBAL',
                type: 'PERCENTAGE',
                usageLimit: 100
            });
        }
        setIsModalOpen(true);
    };

    // 3. Submit Form (Thêm/Sửa)
    const handleFinish = async (values: any) => {
        try {
            // Chuẩn bị dữ liệu gửi đi
            const payload = {
                ...values,
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
                // Nếu là Global thì clear applicableIds để tránh lỗi logic
                applicableIds: values.scope === 'GLOBAL' ? null : values.applicableIds
            };

            let res;
            if (editingDiscount) {
                res = await discountApi.update(editingDiscount.id, payload);
            } else {
                res = await discountApi.create(payload);
            }

            if (res && res.code === 1000) {
                message.success(editingDiscount ? "Cập nhật thành công" : "Tạo mã thành công");
                setIsModalOpen(false);
                fetchDiscounts();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // 4. Xử lý Xóa
    const handleDelete = async (id: number) => {
        try {
            await discountApi.delete(id);
            message.success("Đã xóa mã giảm giá");
            fetchDiscounts();
        } catch (error) {
            message.error("Xóa thất bại");
        }
    };

    // Cột bảng
    const columns: ColumnsType<Discount> = [
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Tag color="blue" style={{ fontSize: 14, fontWeight: 'bold' }}>{text}</Tag>
        },
        {
            title: 'Loại giảm',
            key: 'value',
            render: (_, record) => (
                <span>
                    {record.type === 'PERCENTAGE' 
                        ? `${record.value}% (Max: ${record.maxDiscountAmount?.toLocaleString()}đ)` 
                        : `${record.value.toLocaleString()}đ`}
                </span>
            )
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (val) => val?.toLocaleString() + 'đ'
        },
        {
            title: 'Lượt dùng',
            key: 'usage',
            render: (_, record) => (
                <Tag color={record.usedCount >= record.usageLimit ? 'red' : 'green'}>
                    {record.usedCount} / {record.usageLimit}
                </Tag>
            )
        },
        {
            title: 'Hạn dùng',
            key: 'date',
            render: (_, record) => (
                <Tooltip title={`Từ: ${dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}`}>
                   {dayjs(record.endDate).format('DD/MM/YYYY')}
                </Tooltip>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render: (active) => <Tag color={active ? 'success' : 'default'}>{active ? 'Hoạt động' : 'Đã khóa'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card title="Quản lý Khuyến mãi (Voucher)" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Tạo Mã Mới</Button>
        }>
            <Table 
                columns={columns} 
                dataSource={discounts} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 5 }} 
            />

            {/* --- MODAL FORM --- */}
            <Modal
                title={editingDiscount ? "Cập nhật Voucher" : "Tạo Voucher Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
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
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                         <Form.Item label="Giảm tối đa (Cho loại %)" name="maxDiscountAmount">
                            <InputNumber style={{ width: '100%' }} placeholder="VD: 50,000" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        
                        <Form.Item label="Đơn hàng tối thiểu" name="minOrderValue" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
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

                        {/* Chỉ hiện input ID nếu không phải Global */}
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
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Lưu Voucher</Button>
                    </div>
                </Form>
            </Modal>
        </Card>
    );
};

export default DiscountPage;