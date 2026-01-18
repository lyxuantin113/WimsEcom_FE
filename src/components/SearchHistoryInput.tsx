import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete, Button, message, Space } from 'antd';
import { ClockCircleOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import productApi from '../api/productApi';

interface SearchHistoryInputProps {
    onSearch: (value: string) => void;
    initialValue?: string;
}

const SearchHistoryInput: React.FC<SearchHistoryInputProps> = ({ onSearch, initialValue = '' }) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
    
    // Sử dụng state 'open' để kiểm soát việc đóng mở thủ công
    const [open, setOpen] = useState(false);
    
    // Cờ để chặn việc gọi API quá nhiều lần khi click liên tục
    const isLoadingRef = useRef(false);

    // Đồng bộ giá trị từ cha nếu có (ví dụ khi F5 trang)
    useEffect(() => {
        if (initialValue !== inputValue) {
            setInputValue(initialValue);
        }
    }, [initialValue]);

    // --- 1. HÀM LẤY LỊCH SỬ ---
    const fetchHistory = async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        try {
            const res = await productApi.getSearchHistory();
            if (res && res.result && res.result.length > 0) {
                const historyOptions = res.result.map((item: string) => ({
                    value: item,
                    label: renderItem(item),
                }));
                setOptions(historyOptions);
                setOpen(true); // Có dữ liệu -> mở
            } else {
                setOpen(false); // Không có -> đóng
            }
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            isLoadingRef.current = false;
        }
    };

    // --- 2. HÀM XÓA ITEM ---
    const handleDeleteHistory = async (e: React.MouseEvent, keyword: string) => {
        e.preventDefault();
        e.stopPropagation(); // Chặn sự kiện lan truyền để không chọn nhầm item
        
        try {
            // Update UI trước cho mượt (Optimistic update)
            const newOptions = options.filter(opt => opt.value !== keyword);
            setOptions(newOptions);
            if (newOptions.length === 0) setOpen(false);

            // Gọi API xóa ngầm
            await productApi.deleteSearchHistory(keyword);
        } catch (error) {
            message.error("Xóa thất bại");
            fetchHistory(); // Lỗi thì load lại cái cũ
        }
    };

    // --- 3. RENDER ITEM GIAO DIỆN ---
    const renderItem = (title: string) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#999' }} /> 
                {title}
            </span>
            <Button 
                type="text" size="small"
                onMouseDown={(e) => e.preventDefault()} // 🛑 QUAN TRỌNG: Giữ focus không bị mất khi click nút xóa
                onClick={(e) => handleDeleteHistory(e, title)}
                icon={<CloseOutlined style={{ fontSize: 10, color: '#ccc' }} />} 
                title="Xóa lịch sử"
            />
        </div>
    );

    // --- 4. XỬ LÝ TÌM KIẾM ---
    const handleTriggerSearch = (finalKeyword: string) => {
        setOpen(false); // Đóng dropdown
        onSearch(finalKeyword); // Gọi về cha
    };

    return (
        // Sử dụng Space.Compact để ghép liền khối Input và Button
        <Space.Compact style={{ width: '100%', display: 'flex' }}> 
            <AutoComplete
                style={{ flex: 1, width: 'auto', minWidth: 0 }} 
                value={inputValue}
                options={options}
                open={open}
                onBlur={() => setOpen(false)}
                
                onChange={(text) => {
                    setInputValue(text);
                    if (!text) setOpen(false);
                }}
                onSelect={(value) => {
                    setInputValue(value);
                    handleTriggerSearch(value);
                }}
                onClick={() => {
                    if (!open) fetchHistory();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleTriggerSearch(inputValue);
                        setOpen(false);
                    }
                }}
                placeholder="Tìm tên sản phẩm..."
                filterOption={false}
                popupMatchSelectWidth={300} 
            />

            <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={() => handleTriggerSearch(inputValue)}
                style={{ flexShrink: 0 }} 
            />
        </Space.Compact>
    );
};

export default SearchHistoryInput;