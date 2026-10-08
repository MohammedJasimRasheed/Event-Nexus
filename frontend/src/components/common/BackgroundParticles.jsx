import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const PARTICLE_COUNT = 40;

const BackgroundParticles = () => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();
    const particleColorRef = useRef('rgba(99, 102, 241,');
    const animationFrameRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        particleColorRef.current = isDark ? 'rgba(99, 102, 241,' : 'rgba(56, 189, 248,';
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        let w, h;

        const resizeCanvas = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
        };

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        resizeCanvas();

        // Initialize particles
        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 0.4 - 0.2,
                speedY: Math.random() * 0.4 - 0.2,
                opacity: Math.random() * 0.4 + 0.1,
            });
        }
        particlesRef.current = particles;

        let isPaused = false;
        
        const animate = () => {
            if (!isPaused) {
                ctx.clearRect(0, 0, w, h);
                const color = particleColorRef.current;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.speedX;
                    p.y += p.speedY;

                    if (p.x < 0) p.x = w;
                    else if (p.x > w) p.x = 0;
                    if (p.y < 0) p.y = h;
                    else if (p.y > h) p.y = 0;

                    ctx.fillStyle = `${color}${p.opacity})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        const handlePause = () => { isPaused = true; };
        const handleResume = () => { isPaused = false; };
        
        window.addEventListener('authTransitionStart', handlePause, { passive: true });
        window.addEventListener('authTransitionEnd', handleResume, { passive: true });

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('authTransitionStart', handlePause);
            window.removeEventListener('authTransitionEnd', handleResume);
            clearTimeout(resizeTimeout);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []); // Only run once

    return (
        <canvas
            ref={canvasRef}
            className={`fixed top-0 left-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-20'
                }`}
            style={{
                background: 'transparent',
                willChange: 'opacity, transform',
                transform: 'translateZ(0)'
            }}
        />
    );
};

export default BackgroundParticles;
