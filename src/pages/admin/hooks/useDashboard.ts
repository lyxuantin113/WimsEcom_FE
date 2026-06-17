import { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import axiosClient from '../../../api/axiosClient';

export const useDashboard = () => {
    const currentYear = dayjs().year();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const getYearOptions = () => {
        const startYear = 2023;
        const years = [];
        for (let i = currentYear; i >= startYear; i--) {
            years.push(i);
        }
        return years;
    };

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res: any = await axiosClient.get('/admin/stats', {
                    params: { year: selectedYear } 
                });
                
                if (res.code === 1000) {
                    setStats(res.result);
                }
            } catch (error) {
                message.error('Lỗi tải thống kê');
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, [selectedYear]);

    return {
        stats,
        loading,
        selectedYear,
        setSelectedYear,
        getYearOptions
    };
};
