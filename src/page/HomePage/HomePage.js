import { useEffect, useState, useRef } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';

import HomePageContent from './HomePageContent';
import MyProfileCard from './MyProfileCard';

const MatrixColumn = ({ width, height, index, isMobile }) => {
    const canvasRef = useRef(null);
    const [direction] = useState(Math.random() > 0.5 ? 1 : -1);
    const [speed] = useState(Math.random() * 0.6 + 0.2); // 随机速度因子，范围0.2-1.0
    const [interactiveLetters, setInteractiveLetters] = useState([]);
    const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const columnWidth = width;
        const fontSize = columnWidth * 0.8; // 字母宽度填满列宽的80%
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const interactiveChars = ['S', 'G', 'X', 'Z']; // 可交互的字母，添加Z
        
        // 定义每个可交互字母的颜色
        const interactiveColors = {
            'S': '#FF0000', // 红色
            'G': '#FF0000', // 红色
            'X': '#FF0000', // 红色
            'Z': '#FFD700'  // 金黄色
        };
        
        // 创建一个完整的字母列，确保足够长以避免在视口内看到循环
        const columnHeight = Math.ceil(height / fontSize) * 2; // 增加一些额外的字母，确保循环时有足够的字母
        let letters = [];
        
        // 初始化字母列
        for (let i = 0; i < columnHeight; i++) {
            // 降低可交互字母的出现概率，只有在随机数小于0.05时才考虑使用可交互字母
            let char;
            if (Math.random() < 0.05) {
                // 有5%的概率选择可交互字母
                const randomInteractiveIndex = Math.floor(Math.random() * interactiveChars.length);
                char = interactiveChars[randomInteractiveIndex];
            } else {
                // 95%的概率选择普通字母
                let randomChar;
                do {
                    randomChar = chars[Math.floor(Math.random() * chars.length)];
                } while (interactiveChars.includes(randomChar)); // 确保不选到可交互字母
                char = randomChar;
            }
            
            letters.push(char);
        }
        
        // 初始位置设置为随机，确保每列开始位置不同
        let position = Math.random() * height;
        let animationFrameId;
        let lastTime = 0;
        const targetFPS = 30; // 降低帧率以减少性能消耗
        const frameInterval = 1000 / targetFPS;
        
        // 使用requestAnimationFrame优化渲染
        const draw = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;
            
            if (elapsed > frameInterval) {
                lastTime = timestamp - (elapsed % frameInterval);
                
                ctx.clearRect(0, 0, width, height);
                ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`; // 使用微软雅黑字体
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 存储当前可见的可交互字母位置
                let visibleInteractiveLetters = [];
                
                // 计算实际需要绘制的字母数量，只绘制可见区域内的字母
                const visibleLettersCount = Math.ceil(height / fontSize) + 2; // 多绘制两个字母确保平滑过渡
                
                // 绘制字母列
                for (let i = 0; i < visibleLettersCount; i++) {
                    // 计算当前字母在整个字母列中的索引
                    const letterIndex = Math.floor((position / fontSize + i) % columnHeight);
                    const y = i * fontSize - (position % fontSize);
                    
                    // 只绘制在视口范围内的字母
                    if (y > -fontSize && y < height + fontSize) {
                        const currentChar = letters[letterIndex];
                        // 如果是可交互字母，使用对应的颜色
                        if (interactiveChars.includes(currentChar)) {
                            ctx.fillStyle = interactiveColors[currentChar]; // 使用配置的颜色
                            visibleInteractiveLetters.push({
                                index: letterIndex,
                                char: currentChar,
                                x: width / 2,
                                y: y,
                                radius: fontSize / 2
                            });
                        } else {
                            ctx.fillStyle = '#222'; // 灰色普通字母
                        }
                        ctx.fillText(currentChar, width / 2, y);
                    }
                }
                
                // 更新可交互的字母位置
                setInteractiveLetters(visibleInteractiveLetters);
                
                // 移动位置，使用随机速度
                position += direction * (fontSize / 20) * speed;
                
                // 确保position始终在合理范围内，实现无限循环
                if (position > columnHeight * fontSize) {
                    position = 0; // 循环回到开始
                } else if (position < 0) {
                    position = columnHeight * fontSize; // 循环回到结束
                }
                
                // 每隔一段时间随机更换一些字母，增加变化感
                // 降低字母变化频率以减少计算量
                if (Math.random() < 0.005) {
                    const randomIndex = Math.floor(Math.random() * letters.length);
                    // 降低随机更换为可交互字母的概率
                    if (Math.random() < 0.05) {
                        // 5%的概率选择可交互字母
                        letters[randomIndex] = interactiveChars[Math.floor(Math.random() * interactiveChars.length)];
                    } else {
                        // 95%的概率选择普通字母
                        let randomChar;
                        do {
                            randomChar = chars[Math.floor(Math.random() * chars.length)];
                        } while (interactiveChars.includes(randomChar));
                        letters[randomIndex] = randomChar;
                    }
                }
            }
            
            animationFrameId = requestAnimationFrame(draw);
        };
        
        animationFrameId = requestAnimationFrame(draw);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [width, height, direction, speed]);
    
    // 处理点击事件
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了可交互字母
        for (const letter of interactiveLetters) {
            const dx = x - letter.x;
            const dy = y - letter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < letter.radius) {
                // 点击了可交互字母，执行交互操作
                // alert(`你点击了${letter.char}字母！`);
                if(letter.char === 'S') window.open("https://steamcommunity.com/id/zoomeister64/", "_blank");
                else if(letter.char === 'G') window.open("https://github.com/ZooMEISTER", "_blank");
                else if(letter.char === 'X') window.open("https://x.com/zoomeister64", "_blank");
                else if(letter.char === 'Z') setProfileOpen(true); // 点击Z字母打开个人资料卡
                break; // 找到第一个匹配的字母后退出循环
            }
        }
    };
    
    // 使用防抖处理鼠标移动事件，减少事件触发频率
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let hovering = false;
        
        // 检查鼠标是否悬停在可交互字母上
        for (const letter of interactiveLetters) {
            const dx = x - letter.x;
            const dy = y - letter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < letter.radius) {
                hovering = true;
                break;
            }
        }
        
        setIsHoveringInteractive(hovering);
    };
    
    // 创建一个节流版本的鼠标移动处理函数
    const throttledMouseMove = useRef(null);
    useEffect(() => {
        throttledMouseMove.current = (e) => {
            handleMouseMove(e);
        };
    }, [interactiveLetters]);
    
    const throttleMouseMove = (e) => {
        if (!throttledMouseMove.current) return;
        throttledMouseMove.current(e);
    };
    
    return (
        <>
            <canvas 
                ref={canvasRef} 
                width={width} 
                height={height} 
                style={{ 
                    position: 'absolute', 
                    left: `${index * 100 / (isMobile ? 4 : 10)}%`, 
                    top: 0, 
                    height: '100%',
                    cursor: isHoveringInteractive ? 'pointer' : 'default' // 根据悬停状态动态改变光标样式
                }} 
                onClick={handleCanvasClick}
                onMouseMove={throttleMouseMove}
            />
            <MyProfileCard open={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
};

const HomePage = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:600px)');
    const columnCount = isMobile ? 4 : 10;
    
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: window.innerWidth / columnCount, // 根据设备调整列数
                    height: containerRef.current.offsetHeight // 高度为容器的实际高度
                });
            }
        };
        
        updateDimensions();
        
        // 使用节流函数处理resize事件
        let resizeTimeout;
        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        // 确保在组件挂载后获取正确的高度
        setTimeout(updateDimensions, 100);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeout) clearTimeout(resizeTimeout);
        };
    }, [columnCount]);
    
    return (
        <Box 
            ref={containerRef}
            sx={{ 
                position: 'relative', 
                height: '2000px',
                overflow: 'hidden',
                backgroundColor: '#1A1A1A'
            }}
        >
            {/* 矩阵背景 */}
            {Array.from({ length: columnCount }).map((_, index) => (
                <MatrixColumn 
                    key={index} 
                    width={dimensions.width} 
                    height={dimensions.height} 
                    index={index} 
                    isMobile={isMobile}
                />
            ))}
            
            {/* 内容 */}
            <Box sx={{ 
                position: 'relative', 
                zIndex: 1, 
                textAlign: 'center',
                paddingTop: '100px'
            }}>
                <Typography variant="h3" color="white" fontFamily="Microsoft YaHei, sans-serif">
                    <HomePageContent/>
                </Typography>
            </Box>
        </Box>
    );
};

export default HomePage;