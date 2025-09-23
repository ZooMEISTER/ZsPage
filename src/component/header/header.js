import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n/i18n';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Button, 
    IconButton, 
    useScrollTrigger, 
    Drawer,
    List,
    ListItem,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';

// 创建毛玻璃效果的AppBar（减轻效果）
const GlassAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'trigger'
})(({ theme, trigger }) => ({
    background: trigger ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    backdropFilter: trigger ? 'blur(5px)' : 'none',
    boxShadow: trigger ? '0 2px 15px rgba(0, 0, 0, 0.05)' : 'none',
    borderBottom: trigger ? '1px solid rgba(255, 0, 0, 0.8)' : '1px solid rgba(255, 0, 0, 0)',
    transition: 'all 0.3s ease-in-out',
    color: '#fff'
}));

// 创建动画Logo组件
const AnimatedLogo = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

// 创建菜单按钮
const MenuButton = styled(Button)(({ theme }) => ({
  margin: '0 8px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: 0,
    left: '50%',
    background: '#FF0000', // 改为红色
    transition: 'all 0.3s ease-in-out',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '80%',
  }
}));

// 创建语言切换按钮
const LanguageButton = styled(Button)(({ theme }) => ({
  margin: '0 8px',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  }
}));

// 创建移动端抽屉样式
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '70%',
    maxWidth: '300px',
    background: 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: theme.spacing(2)
  },
}));

// 创建颜色渐变动画
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Header = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // 菜单项
    const MenuItems = [
        {
            title: "HOME",
            link: "/"
        },
        {
            title: "BLOG",
            link: "/blog"
        },
        {
            title: "ASSISTANT",
            link: "/assistant"
        }
    ]

    // 切换语言
    const changeLanguage = () => {
        const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
        i18n.changeLanguage(newLang);
        setDrawerOpen(false);
    };

    // 抽屉控制
    const toggleDrawer = (open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    // 导航并关闭抽屉
    const handleNavigation = (path) => {
        navigate(path);
        setDrawerOpen(false);
    };

    // Logo动画变体
    const logoVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.5,
            ease: "easeOut"
        }
        }
    };

    // 菜单项动画变体
    const menuItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: i => ({ 
        opacity: 1, 
        y: 0,
        transition: { 
            delay: i * 0.1,
            duration: 0.5
        }
        })
    };

    return (
        <GlassAppBar position="fixed" trigger={trigger} style={{height: "60px"}}>
            <Toolbar style={{height: "100%", display: 'flex', justifyContent: 'space-between'}}>
                {/* 左侧Logo */}
                <Box sx={{ flexGrow: 0 }}>
                <AnimatedLogo
                    initial="hidden"
                    animate="visible"
                    variants={logoVariants}
                >
                    <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(-45deg, #FF0000, #FF3300, #FF6600, #FF9900, #FFCC00, #FF6600, #FF3300, #FF0000)',
                        backgroundSize: '400% 400%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        animation: `${gradientAnimation} 8s ease infinite`,
                    }}
                    >
                        ZOOMEISTER
                    </Typography>
                </AnimatedLogo>
                </Box>

                {/* 桌面端菜单 - 完全居中 */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    {MenuItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={menuItemVariants}
                            >
                            <MenuButton 
                                color="inherit"
                                onClick={() => navigate(item.link || item.LINK)}
                                component="a"
                            >
                                {t(item.title)}
                            </MenuButton>
                        </motion.div>
                    ))}
                    </Box>
                )}

                {/* 桌面端语言切换 */}
                {!isMobile && (
                    <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <LanguageButton
                            color="inherit"
                            startIcon={<LanguageIcon />}
                            onClick={changeLanguage}
                            variant="outlined"
                            sx={{
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '20px',
                                px: 2
                            }}
                        >
                            {i18n.language === 'zh-CN' ? 'English' : '中文'}
                        </LanguageButton>
                    </motion.div>
                    </Box>
                )}

                {/* 移动端菜单按钮 */}
                {isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                            edge="end" 
                            color="inherit" 
                            aria-label="menu"
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                )}

                {/* 移动端抽屉菜单 */}
                <StyledDrawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                >
                    <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(-45deg, #FF0000, #FF3300, #FF6600, #FF9900, #FFCC00, #FF6600, #FF3300, #FF0000)',
                                backgroundSize: '400% 400%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 3,
                                textAlign: 'center',
                                animation: `${gradientAnimation} 8s ease infinite`,
                            }}
                        >
                            ZOOMEISTER
                        </Typography>

                        <List>
                            {MenuItems.map((item) => (
                                <ListItem 
                                    button 
                                    key={item.title} 
                                    component="a"
                                    onClick={() => handleNavigation(item.link || item.LINK)}
                                    sx={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        py: 1.5
                                    }}
                                >
                                    <ListItemText style={{color: 'white'}} primary={t(item.title)} />
                                </ListItem>
                            ))}
                            <ListItem button onClick={changeLanguage} sx={{ 
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                py: 1.5
                            }}>
                                <ListItemText primary={i18n.language === 'zh-CN' ? 'Switch to English' : '切换到中文'} />
                                <LanguageIcon sx={{ ml: 1 }} />
                            </ListItem>
                        </List>
                    </Box>
                </StyledDrawer>
            </Toolbar>
        </GlassAppBar>
    );
};

export default Header;