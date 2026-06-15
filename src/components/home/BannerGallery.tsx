import React from 'react';
import { Row, Col, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { BannerResponse } from '../../types/backend';

interface BannerGalleryProps {
    banners: BannerResponse[];
}

const BannerGallery: React.FC<BannerGalleryProps> = ({ banners }) => {
    const navigate = useNavigate();

    if (!banners || banners.length === 0) {
        return null;
    }

    const renderBannerImage = (banner: BannerResponse, height: string | number) => (
        <a onClick={() => banner.linkUrl && navigate(banner.linkUrl)} style={{ display: 'block', height: '100%', cursor: 'pointer' }}>
            <img
                src={banner.imageUrl}
                style={{ width: '100%', height, objectFit: 'cover' }}
                alt="banner"
            />
        </a>
    );

    // Chỉ có 1 banner -> Hiển thị full
    if (banners.length === 1) {
        return (
            <div style={{ width: '100%', height: 500 }}>
                {renderBannerImage(banners[0], 500)}
            </div>
        );
    }

    // Có 2 banner -> Chia đôi
    if (banners.length === 2) {
        return (
            <Row style={{ height: 500 }}>
                <Col xs={24} md={16} style={{ height: '100%' }}>
                    {renderBannerImage(banners[0], '100%')}
                </Col>
                <Col xs={24} md={8} style={{ height: '100%' }}>
                    {renderBannerImage(banners[1], '100%')}
                </Col>
            </Row>
        );
    }

    // Có từ 3 banner trở lên
    const rightBanners = [banners[1], banners[2]]; // Cột phải luôn lấy banner 2 và 3
    const leftBanners = [banners[0], ...banners.slice(3)]; // Cột trái lấy banner 1 và các banner từ 4 trở đi

    return (
        <Row style={{ height: 500 }}>
            {/* Cột trái (Slide nếu > 1 banner) */}
            <Col xs={24} md={16} style={{ height: '100%' }}>
                {leftBanners.length > 1 ? (
                    <Carousel autoplay effect="fade" style={{ height: '100%', overflow: 'hidden' }}>
                        {leftBanners.map(banner => (
                            <div key={banner.id} style={{ height: 500 }}>
                                {renderBannerImage(banner, 500)}
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    <div style={{ height: '100%' }}>
                        {renderBannerImage(leftBanners[0], '100%')}
                    </div>
                )}
            </Col>

            {/* Cột phải (2 banner trên dưới) */}
            <Col xs={24} md={8} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {renderBannerImage(rightBanners[0], '100%')}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {renderBannerImage(rightBanners[1], '100%')}
                </div>
            </Col>
        </Row>
    );
};

export default BannerGallery;
