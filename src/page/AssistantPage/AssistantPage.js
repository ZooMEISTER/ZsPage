import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { touristRequest } from '../../util/request';

const AssistantPage = () => {
    const { t } = useTranslation();

    // 用户登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 当前对话的消息列表
    const [messages, setMessages] = useState([]);
    // 输入框中的消息
    const [inputMessage, setInputMessage] = useState('');
    // 加载状态
    const [isLoading, setIsLoading] = useState(false);
    // 历史对话列表
    const [conversations, setConversations] = useState([]);
    // 当前选中的对话ID
    const [currentConversationId, setCurrentConversationId] = useState(null);
    // 登录对话框开关
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    // 用户名输入
    const [username, setUsername] = useState('');
    // 密码输入
    const [password, setPassword] = useState('');
    // 登录错误信息
    const [loginError, setLoginError] = useState('');
    // 已登录用户名
    const [loggedInUsername, setLoggedInUsername] = useState('');

    // 模拟检查用户登录状态
    useEffect(() => {
        // 检查本地存储中是否有登录令牌
        const token = localStorage.getItem('authToken');
        if (token) {
            // 验证令牌有效性，就是自动登录
            validateToken(token);
        }
        else{
            // 没有令牌，则打开登录对话框
            setLoginDialogOpen(true);
        }
    }, []);

    // 获取历史对话
    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            // 这里应该是获取历史对话的API请求
            // const response = await axios.get('/api/conversations', {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            // });
            // setConversations(response.data);
            
            // 模拟获取历史对话
            setTimeout(() => {
                setConversations([
                    { id: '1', title: '示例对话1', createdAt: new Date().toISOString() },
                    { id: '2', title: '示例对话2', createdAt: new Date().toISOString() }
                ]);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('获取历史对话失败:', error);
            setIsLoading(false);
        }
    };

    // 获取特定对话的消息
    const fetchMessages = async (conversationId) => {
        try {
            setIsLoading(true);
            // 这里应该是获取特定对话消息的API请求
            // const response = await axios.get(`/api/conversations/${conversationId}/messages`, {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            // });
            // setMessages(response.data);
            
            // 模拟获取消息
            setTimeout(() => {
                setMessages([
                    { role: 'user', content: '你好，AI助手' },
                    { role: 'assistant', content: '你好！我是AI助手，有什么可以帮助你的吗？' }
                ]);
                setCurrentConversationId(conversationId);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('获取消息失败:', error);
            setIsLoading(false);
        }
    };

    // 创建新对话
    const createNewConversation = async () => {
        try {
            setIsLoading(true);
            // 这里应该是创建新对话的API请求
            // const response = await axios.post('/api/conversations', {}, {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            // });
            // setCurrentConversationId(response.data.id);
            
            // 模拟创建新对话
            setTimeout(() => {
                const newId = Date.now().toString();
                setConversations(prev => [...prev, { 
                    id: newId, 
                    title: '新对话', 
                    createdAt: new Date().toISOString() 
                }]);
                setCurrentConversationId(newId);
                setMessages([]);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('创建新对话失败:', error);
            setIsLoading(false);
        }
    };

    
    // 发送消息处理按键事件
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    // 发送消息
    const sendMessage = async () => {
        if (!inputMessage.trim() || !currentConversationId) return;
        
        const userMessage = { role: 'user', content: inputMessage };
        setMessages([...messages, userMessage]);
        setInputMessage('');
        
        try {
            setIsLoading(true);
            // 这里应该是发送消息的API请求
            // const response = await axios.post(`/api/conversations/${currentConversationId}/messages`, {
            //     content: inputMessage
            // }, {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            // });
            
            // 模拟AI回复
            setTimeout(() => {
                const aiMessage = { role: 'assistant', content: '这是AI的回复示例，我收到了你的消息。' };
                setMessages(prev => [...prev, aiMessage]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('发送消息失败:', error);
            setIsLoading(false);
        }
    };

    // #region 登录登出相关方法
    // 验证令牌，也就是自动登录，在该页面加载时自动调用
    const validateToken = async (token) => {
        try {
            // 这里应该是验证令牌的API请求
            touristRequest.post('/tourist/autologin', {
                authToken: token
            })
            .then(async function (response) {
                console.log(response);
                if(response.data.code === 10000){
                    // 登陆成功
                    // 登录成功后显示提示
                    enqueueSnackbar(t(response.data.msg), { 
                        variant: 'success',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        autoHideDuration: 2000
                    });
                    // 保存 token
                    localStorage.setItem('authToken', response.data.token);
                    // 设置登录状态
                    setIsLoggedIn(true);
                    // 设置用户名
                    setLoggedInUsername(response.data.username || t("USER"));
                    // 获取历史对话
                    fetchConversations();
                }
                else{
                    // 登陆失败
                    // 使用对话框显示登录失败信息
                    setLoginError(response.data.code + ':' + response.data.msg);
                    // 打开登录对话框显示错误信息
                    setLoginDialogOpen(true);
                }
            })
            .catch(function (error) {
                console.log(error);
            })
        } catch (error) {
            console.error(t("TOKEN_VALIDATION_FAILED") + ':', error);
            localStorage.removeItem('authToken');
        }
    };
    // 打开登录对话框
    const openLoginDialog = () => {
        setLoginDialogOpen(true);
        setLoginError('');
    };
    // 关闭登录对话框
    const closeLoginDialog = () => {
        setLoginDialogOpen(false);
        setUsername('');
        setPassword('');
        setLoginError('');
    };
    // 处理登录
    const handleLogin = async () => {
        if (!username || !password) {
            setLoginError(t("PLS_INPUT_USERNAME_AND_PASSWORD"));
            return;
        }

        setIsLoading(true);
        // 这里应该是登录的API请求
        touristRequest.post('/tourist/login', {
            username: username,
            password: password
        })
        .then(async function (response) {
            console.log(response);
            if(response.data.code === 10000){
                // 登陆成功
                // 登录成功后显示提示
                enqueueSnackbar(t(response.data.msg), { 
                    variant: 'success',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    autoHideDuration: 2000
                });
                // 保存 token
                localStorage.setItem('authToken', response.data.token);
                // 关闭登录对话框
                closeLoginDialog();
                // 设置登录状态
                setIsLoggedIn(true);
                // 设置用户名
                setLoggedInUsername(username);
                // 获取历史对话
                fetchConversations();
            }
            else{
                // 登陆失败
                setLoginError(response.data.code + ':' + response.data.msg);
            }
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
            setIsLoading(false);
        })
    };
    // 处理登出
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setCurrentConversationId(null);
        setConversations([]);
        setMessages([]);
        setLoggedInUsername('');
    };
    // #endregion

    return (
        <SnackbarProvider>
            <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 60px)', paddingTop: '60px' }}>
                {/* 历史消息栏和登录 */}
                <div style={{ flex: 0.3, height: '100%', backgroundColor: '#1A1A1A', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    {!isLoggedIn ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Button 
                                variant="contained" 
                                onClick={openLoginDialog}
                                sx={{ 
                                    backgroundColor: '#FF0000', 
                                    '&:hover': { backgroundColor: '#CC0000' },
                                    padding: '10px 20px'
                                }}
                            >
                                登录
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<AddIcon />}
                                    onClick={createNewConversation}
                                    sx={{ 
                                        backgroundColor: '#FF0000', 
                                        '&:hover': { backgroundColor: '#CC0000' },
                                        flex: 1,
                                        mr: 1
                                    }}
                                >
                                    新对话
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={handleLogout}
                                    sx={{ 
                                        borderColor: '#FF0000',
                                        color: '#FF0000',
                                        '&:hover': { 
                                            borderColor: '#CC0000',
                                            backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                        }
                                    }}
                                >
                                    登出
                                </Button>
                            </Box>
                            <Divider sx={{ backgroundColor: '#333' }} />
                            <Typography variant="h6" sx={{ p: 2, color: '#FFF' }}>
                                历史对话
                            </Typography>
                            <List sx={{ overflow: 'auto', flex: 1 }}>
                                {isLoading && conversations.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} sx={{ color: '#FF0000' }} />
                                    </Box>
                                ) : (
                                    conversations.map((conv) => (
                                        <ListItem 
                                            button 
                                            key={conv.id}
                                            selected={currentConversationId === conv.id}
                                            onClick={() => fetchMessages(conv.id)}
                                            sx={{ 
                                                '&.Mui-selected': { 
                                                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                                    '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.2)' }
                                                },
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                                            }}
                                        >
                                            <ListItemText 
                                                primary={conv.title || '未命名对话'} 
                                                secondary={new Date(conv.createdAt).toLocaleString()}
                                                primaryTypographyProps={{ color: '#FFF' }}
                                                secondaryTypographyProps={{ color: '#AAA' }}
                                            />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                            {/* 显示已登录用户名 */}
                            <Box sx={{ 
                                p: 2, 
                                borderTop: '1px solid #333', 
                                display: 'flex', 
                                alignItems: 'center',
                                backgroundColor: '#222'
                            }}>
                                <Typography sx={{ color: '#AAA', fontSize: '0.9rem' }}>
                                    已登录：
                                </Typography>
                                <Typography sx={{ color: '#FF0000', fontWeight: 'bold', ml: 1 }}>
                                    {loggedInUsername}
                                </Typography>
                            </Box>
                        </>
                    )}
                </div>
                
                {/* 聊天界面 */}
                <div style={{ flex: 1, height: '100%', backgroundColor: '#1A1A1A', display: 'flex', flexDirection: 'column' }}>
                    {/* 消息显示区域 */}
                    <Box sx={{ 
                        flex: 1, 
                        p: 2, 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        {messages.length === 0 && !isLoading && (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                color: '#888'
                            }}>
                                <Typography variant="h6">
                                    {isLoggedIn 
                                        ? currentConversationId 
                                            ? '开始新的对话吧！' 
                                            : '请选择一个对话或创建新对话' 
                                        : '请先登录'}
                                </Typography>
                            </Box>
                        )}
                        {messages.map((msg, index) => (
                            <Box 
                                key={index} 
                                sx={{ 
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%'
                                }}
                            >
                                <Paper 
                                    elevation={1} 
                                    sx={{ 
                                        p: 2, 
                                        backgroundColor: msg.role === 'user' ? '#333' : '#FF0000',
                                        color: '#FFF',
                                        borderRadius: '10px'
                                    }}
                                >
                                    <Typography>{msg.content}</Typography>
                                </Paper>
                            </Box>
                        ))}
                        {isLoading && (
                            <Box sx={{ alignSelf: 'flex-start', p: 2 }}>
                                <CircularProgress size={24} sx={{ color: '#FF0000' }} />
                            </Box>
                        )}
                    </Box>
                    
                    {/* 消息输入区域 */}
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: '#222', 
                        display: 'flex', 
                        alignItems: 'center',
                        borderTop: '1px solid #333'
                    }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isLoggedIn ? (currentConversationId ? "输入消息..." : "请先选择或创建对话") : "请先登录"}
                            variant="outlined"
                            disabled={isLoading || (!isLoggedIn || !currentConversationId)}
                            sx={{
                                mr: 1,
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    backgroundColor: '#333',
                                    '& fieldset': {
                                        borderColor: '#444',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                },
                            }}
                        />
                        <IconButton 
                            color="primary" 
                            onClick={sendMessage}
                            disabled={isLoading || !inputMessage.trim() || (!isLoggedIn || !currentConversationId)}
                            sx={{ 
                                backgroundColor: '#FF0000', 
                                color: '#FFF',
                                '&:hover': { backgroundColor: '#CC0000' },
                                '&.Mui-disabled': { backgroundColor: '#555', color: '#888' }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </div>

                {/* 登录对话框 */}
                <Dialog 
                    open={loginDialogOpen} 
                    onClose={closeLoginDialog}
                    PaperProps={{
                        style: {
                            backgroundColor: '#222',
                            color: '#FFF',
                            borderRadius: '10px',
                            minWidth: '300px'
                        }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid #333' }}>
                        用户登录
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {loginError && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {loginError}
                            </Typography>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="用户名"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    '& fieldset': {
                                        borderColor: '#444',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#AAA',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#FF0000',
                                },
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="密码"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    '& fieldset': {
                                        borderColor: '#444',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF0000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#AAA',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#FF0000',
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
                        <Button 
                            onClick={closeLoginDialog} 
                            sx={{ color: '#AAA' }}
                        >
                            取消
                        </Button>
                        <Button 
                            onClick={handleLogin} 
                            variant="contained"
                            disabled={isLoading}
                            sx={{ 
                                backgroundColor: '#FF0000', 
                                '&:hover': { backgroundColor: '#CC0000' }
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : '登录'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </SnackbarProvider>
    );
};

export default AssistantPage;
