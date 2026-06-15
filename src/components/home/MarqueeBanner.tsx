import React from 'react';

const MarqueeBanner: React.FC = () => {
    // Đoạn text lặp lại
    const repeatCount = 10;
    const textArray = Array(repeatCount).fill('WIMS SHOP');

    return (
        <div style={styles.container}>
            <style>
                {`
                @keyframes marqueeLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marqueeRight {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .marquee-track-left {
                    display: inline-flex;
                    white-space: nowrap;
                    animation: marqueeLeft 30s linear infinite;
                }
                .marquee-track-right {
                    display: inline-flex;
                    white-space: nowrap;
                    animation: marqueeRight 30s linear infinite;
                }
                .text-filled {
                    color: #ffffff;
                }
                .text-outline {
                    color: transparent;
                    -webkit-text-stroke: 1.5px #ffffff;
                }
                .marquee-item {
                    font-size: 60px;
                    font-weight: 900;
                    font-family: 'Arial', sans-serif;
                    text-transform: uppercase;
                    margin-right: 30px;
                    letter-spacing: 4px;
                }
                `}
            </style>

            {/* Dòng 1: Chạy sang trái */}
            <div style={styles.row}>
                <div className="marquee-track-left">
                    {/* Render 2 nửa giống hệt nhau để loop mượt */}
                    <div style={{ display: 'flex' }}>
                        {textArray.map((text, index) => (
                            <span key={`l1-${index}`} className={`marquee-item ${index % 2 === 0 ? 'text-outline' : 'text-filled'}`}>
                                {text}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex' }}>
                        {textArray.map((text, index) => (
                            <span key={`l2-${index}`} className={`marquee-item ${index % 2 === 0 ? 'text-outline' : 'text-filled'}`}>
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dòng 2: Chạy sang phải */}
            <div style={styles.row}>
                <div className="marquee-track-right">
                    <div style={{ display: 'flex' }}>
                        {textArray.map((text, index) => (
                            <span key={`r1-${index}`} className={`marquee-item ${index % 2 !== 0 ? 'text-outline' : 'text-filled'}`}>
                                {text}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex' }}>
                        {textArray.map((text, index) => (
                            <span key={`r2-${index}`} className={`marquee-item ${index % 2 !== 0 ? 'text-outline' : 'text-filled'}`}>
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'var(--color-primary)', // Màu nền đỏ đô giống ảnh
        overflow: 'hidden',
        padding: '.5rem 0',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
    },
    row: {
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
    }
};

export default MarqueeBanner;
