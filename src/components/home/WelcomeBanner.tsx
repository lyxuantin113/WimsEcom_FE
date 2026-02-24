import React, { useEffect, useRef } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface Particle {
    x: number;
    y: number;
    size: number;
    baseX: number;
    baseY: number;
    density: number;
    color: string;
}

interface WelcomeBannerProps {
    title?: string;
    subtitle?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
    title = "Chào Mừng Đến Với WIMS", 
    subtitle = "Trải nghiệm mua sắm hiện đại & phong cách" 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 150;
        const pixelRatio = window.devicePixelRatio || 1;

        const initCanvas = () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(pixelRatio, pixelRatio);
            
            initParticles(width, height);
        };

        const initParticles = (width: number, height: number) => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    x,
                    y,
                    size: Math.random() * 2 + 1,
                    baseX: x,
                    baseY: y,
                    density: (Math.random() * 30) + 1,
                    color: `rgba(133, 61, 44, ${Math.random() * 0.4 + 0.1})` // Dựa trên màu chủ đạo #853d2c
                });
            }
        };

        const animate = () => {
            if (!ctx) return;
            const width = canvas.width / pixelRatio;
            const height = canvas.height / pixelRatio;

            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                if (mouseRef.current.active) {
                    const dx = mouseRef.current.x - p.x;
                    const dy = mouseRef.current.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const maxDistance = 150; // Giảm khoảng cách tương tác để tinh tế hơn
                    if (distance < maxDistance) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (maxDistance - distance) / maxDistance;
                        p.x += forceDirectionX * force * (p.density / 2); // Giảm tốc độ hút để mượt hơn
                        p.y += forceDirectionY * force * (p.density / 2);
                    } else {
                        // Trôi về vị trí cũ nếu ngoài vùng tương tác
                        p.x -= (p.x - p.baseX) / 20;
                        p.y -= (p.y - p.baseY) / 20;
                    }
                } else {
                    // MẶC ĐỊNH: Không hút về tâm, chỉ trôi về vị trí gốc và đứng yên
                    if (Math.abs(p.x - p.baseX) > 0.1) {
                        p.x -= (p.x - p.baseX) / 10;
                    }
                    if (Math.abs(p.y - p.baseY) > 0.1) {
                        p.y -= (p.y - p.baseY) / 10;
                    }
                }

                // Vẽ hạt
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('resize', initCanvas);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        initCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', initCanvas);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="welcome-banner-container"
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '75vh', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                marginBottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 'var(--shadow-md)'
            }}
        >
            <canvas 
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
            
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
                <Title 
                    className="animate-glow"
                    style={{ 
                        fontSize: '48px', 
                        fontWeight: 900, 
                        fontFamily: 'Gotham Rounded',
                        marginBottom: '12px',
                        background: 'linear-gradient(45deg, var(--color-primary), #662e25)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px',
                        textTransform: 'uppercase'
                    }}
                >
                    {title}
                </Title>
                <Text 
                    style={{ 
                        fontSize: '18px', 
                        color: 'var(--text-muted)', 
                        fontWeight: 500,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}
                >
                    {subtitle}
                </Text>
            </div>

            <style>{`
                @keyframes glow {
                    0% { filter: drop-shadow(0 0 2px rgba(133, 61, 44, 0.2)); }
                    50% { filter: drop-shadow(0 0 10px rgba(133, 61, 44, 0.4)); }
                    100% { filter: drop-shadow(0 0 2px rgba(133, 61, 44, 0.2)); }
                }
                .animate-glow {
                    animation: glow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default WelcomeBanner;
