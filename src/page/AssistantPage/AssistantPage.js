import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Box, TextField, Button, Typography, Paper, CircularProgress, List, ListItem, ListItemText, ListItemIcon, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, useMediaQuery, IconButton, Drawer, Menu } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { touristRequest, userRequest } from '../../util/request';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/atom-one-dark.css'; // 你可以换成别的主题
import './AssistantPage.css';

// 可配置的模型列表
const AVAILABLE_MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5-Turbo' }
];

const AssistantPage = () => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width:768px)');

    // 用户登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 当前对话的消息列表
    const [messages, setMessages] = useState([]);
    // 输入框中的消息
    const [haveInputMessage, setHaveInputMessage] = useState(false);
    const inputMessageRef = useRef('');
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
    // 选择的模型
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
    // 输入框高度
    const [textFieldHeight, setTextFieldHeight] = useState(76); // 初始高度
    // 流式响应中的当前文本
    const [streamingResponse, setStreamingResponse] = useState('');
    // 是否正在流式响应
    const [isStreaming, setIsStreaming] = useState(false);
    // 消息区域的引用，用于自动滚动
    const messagesEndRef = useRef(null);
    // 当前使用的模型
    const [currentResponseModel, setCurrentResponseModel] = useState('');
    // 是否是临时对话（前端创建但未保存到后端）
    const [isTempConversation, setIsTempConversation] = useState(false);
    // 移动端侧边栏开关
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // 桌面端侧边栏折叠状态
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    // 对话菜单状态
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    // 当前操作的对话ID
    const [menuConversationId, setMenuConversationId] = useState(null);

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

    // 自动滚动到最新消息
    useEffect(() => {
        if (messagesEndRef.current) {
            // 只有在流式响应时才使用平滑滚动
            if (isStreaming) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
                // 其他情况直接定位到底部，不使用滚动效果
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [messages, streamingResponse, isStreaming]);

    // 获取历史对话
    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            // 获取历史对话的API请求
            userRequest.get('/conversation/get-all-conversation')
            .then(async function (response) {
                console.log(response);
                if (response.data.data && Array.isArray(response.data.data)) {
                    // 处理返回的对话数据
                    const formattedConversations = response.data.data.map(conv => ({
                        id: conv.id,
                        title: conv.title || '未命名对话',
                        createdAt: conv.create_time,
                        updatedAt: conv.update_time
                    }));
                    setConversations(formattedConversations);
                } else {
                    console.error('获取历史对话返回格式错误:', response.data);
                    setConversations([]);
                }
                setIsLoading(false);
            })
            .catch(function (error) {
                console.error('获取历史对话失败:', error);
                setIsLoading(false);
                enqueueSnackbar(t("FETCH_CONVERSATIONS_FAILED"), { 
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    autoHideDuration: 3000
                });
            });
        } catch (error) {
            console.error('获取历史对话失败:', error);
            setIsLoading(false);
        }
    };

    // 获取特定对话的消息
    const fetchMessages = async (conversationId) => {
        try {
            setIsLoading(true);
            // 获取特定对话消息的API请求
            userRequest.get('/conversation/get-conversation-content', {
                params: { conversationId: conversationId }
            })
            .then(async function (response) {
                console.log(response);
                if (response.data.data && Array.isArray(response.data.data)) {
                    // 处理返回的消息数据
                    const formattedMessages = response.data.data.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        model: msg.model || '' // 添加模型信息
                    }));
                    setMessages(formattedMessages);
                    setCurrentConversationId(conversationId);
                    setIsTempConversation(false); // 从数据库加载的对话不是临时对话
                    
                    // 在移动端选择对话后关闭侧边栏
                    if (isMobile) {
                        setSidebarOpen(false);
                    }
                } else {
                    console.error('获取对话消息返回格式错误:', response.data);
                    setMessages([]);
                }
                setIsLoading(false);
            })
            .catch(function (error) {
                console.error('获取对话消息失败:', error);
                setIsLoading(false);
                enqueueSnackbar(t("FETCH_MESSAGES_FAILED"), { 
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    autoHideDuration: 3000
                });
            });
        } catch (error) {
            console.error('获取消息失败:', error);
            setIsLoading(false);
        }
    };

    // 创建新对话
    const createNewConversation = async () => {
        try {
            // 只在前端创建临时对话，不调用API
            const newId = 'temp_' + Date.now().toString();
            setCurrentConversationId(newId);
            setMessages([]);
            setIsTempConversation(true); // 设置为临时对话
            
            // 在移动端创建新对话后关闭侧边栏
            if (isMobile) {
                setSidebarOpen(false);
            }
        } catch (error) {
            console.error('创建新对话失败:', error);
        }
    };

    
    // 发送消息处理按键事件
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    
    // 创建新对话到数据库
    const createConversationInDB = async (title) => {
        try {
            const response = await userRequest.post('/conversation/create-new-conversation', {
                title: title // 使用用户的第一条消息作为对话标题
            });
            
            if (response.data.code === 200) {
                return response.data.data.id;
            } else {
                throw new Error('创建对话失败: ' + response.data.msg);
            }
        } catch (error) {
            console.error('创建对话失败:', error);
            enqueueSnackbar('创建对话失败，请重试', { 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                autoHideDuration: 3000
            });
            throw error;
        }
    };
    
    // 发送消息
    const sendMessage = async () => {
        if (!inputMessageRef.current.trim() || !currentConversationId) return;
        
        const userMessage = { role: 'user', content: inputMessageRef.current };
        setMessages(prev => [...prev, userMessage]);
        inputMessageRef.current = '';
        setHaveInputMessage(false);
        document.getElementById('inputMessageTextField').value = '';

        
        try {
            setIsLoading(true);
            
            // 如果是临时对话，先创建新对话
            let conversationId = currentConversationId;
            if (isTempConversation) {
                try {
                    // 创建新对话并获取真实ID，使用用户的第一条消息作为对话标题
                    conversationId = await createConversationInDB(userMessage.content);
                    // 刷新对话列表
                    fetchConversations();
                    
                    // 更新当前对话ID
                    setCurrentConversationId(conversationId);
                    // 不再是临时对话
                    setIsTempConversation(false);
                } catch (error) {
                    // 创建对话失败，恢复消息列表
                    setMessages(prev => prev.slice(0, -1));
                    setIsLoading(false);
                    return;
                }
            }
            
            // 开始流式响应
            setIsStreaming(true);
            setStreamingResponse('');
            setCurrentResponseModel(selectedModel); // 设置当前响应使用的模型
            
            // 准备发送的消息数据，包含所有历史消息和当前新消息
            const rawJsonMessages = [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            
            // 使用流式API发送消息
            const response = await fetch(process.env.REACT_APP_BACKEND_ADDRESS + '/chat/stream', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    conversationId: conversationId,
                    model: selectedModel,
                    rawJsonMessages: JSON.stringify(rawJsonMessages)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let buffer = ''; // 用于缓存不完整的 JSON 字符串

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // 拆分为多行（OpenAI SSE 使用 "\n" 分隔每个data段）
                const lines = buffer.split('\n');

                // 留下最后一行作为新的 buffer，其他行我们尝试解析
                buffer = lines.pop();

                for (const line of lines) {
                    const jsonStr = line.startsWith('data:') ? line.substring(5).trim() : line.trim();

                    // 跳过空行或 [DONE]
                    if (!jsonStr || jsonStr === '[DONE]') continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.choices?.[0]?.delta?.content) {
                            const content = data.choices[0].delta.content;
                            fullText += content;
                            setStreamingResponse(fullText);
                        }
                    } catch (e) {
                        console.warn('当前行无法解析，可能是被截断:', jsonStr);
                        // 保留在 buffer 中拼接到下一次
                        buffer = jsonStr;
                    }
                }
            }

            // 最后一段如果还有内容且是完整 JSON，可以尝试解析
            if (buffer && buffer !== '[DONE]') {
                try {
                    const finalData = JSON.parse(buffer);
                    if (finalData.choices?.[0]?.delta?.content) {
                        const content = finalData.choices[0].delta.content;
                        fullText += content;
                        setStreamingResponse(fullText);
                    }
                } catch (e) {
                    console.error('最后残留内容解析失败:', e);
                    enqueueSnackbar(t("REMAINING_CONTENT_PARSE_FAILED") + e, { 
                        variant: 'error',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        autoHideDuration: 3000
                    });
                }
            }

            // 流式响应完成后，将完整响应添加到消息列表
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: fullText,
                model: selectedModel // 保存使用的模型信息
            }]);
            
            // 刷新对话列表
            fetchConversations();
            
            setIsStreaming(false);
            setIsLoading(false);
        } catch (error) {
            console.error('发送消息失败:', error);
            setIsLoading(false);
            setIsStreaming(false);
            enqueueSnackbar(t("SEND_MESSAGE_FAILED"), { 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                autoHideDuration: 3000
            });
        }
    };

    // 处理输入框内容变化，动态调整高度
    const handleInputChange = (e) => {
        if(e.target.value.trim().length > 0){
            setHaveInputMessage(true);
        }
        else{
            setHaveInputMessage(false);
        }
        inputMessageRef.current = e.target.value;
        
        // 计算文本行数来调整高度
        const lineCount = (e.target.value.match(/\n/g) || []).length + 1;
        const newHeight = Math.max(76, Math.min(160, 56 + (lineCount - 1) * 20)); // 限制最大高度
        setTextFieldHeight(newHeight);
    };

    // 处理对话菜单打开
    const handleMenuOpen = (event, conversationId) => {
        event.stopPropagation(); // 阻止事件冒泡，防止触发对话选择
        setMenuAnchorEl(event.currentTarget);
        setMenuConversationId(conversationId);
    };

    // 处理对话菜单关闭
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuConversationId(null);
    };

    // 处理删除对话
    const handleDeleteConversation = async () => {
        try {
            // 关闭菜单
            handleMenuClose();
            
            if (window.confirm(t("DELETE_CONVERSATION_CONFIRM"))) {
                // 用户点击“确定”
                // 发送删除请求到后端
                const response = await userRequest.post('/conversation/delete', {
                    conversationId: menuConversationId
                });
                
                if (response.data.code === 200) {
                    // 删除成功
                    // enqueueSnackbar(t("DELETE_CONVERSATION_SUCCESS"), { 
                    //     variant: 'success',
                    //     anchorOrigin: {
                    //         vertical: 'top',
                    //         horizontal: 'center',
                    //     },
                    //     autoHideDuration: 2000
                    // });
                
                    // 如果删除的是当前对话，清空当前对话
                    if (menuConversationId === currentConversationId) {
                        setCurrentConversationId(null);
                        setMessages([]);
                    }
                    
                    // 刷新对话列表
                    fetchConversations();
                } else {
                    // 删除失败
                    enqueueSnackbar(response.data.code + ':' + response.data.msg, { 
                        variant: 'error',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        autoHideDuration: 3000
                    });
                }
            } else {
                // 用户点击“取消”
                console.log("取消删除");
            }
            
        } catch (error) {
            console.error('删除对话失败:', error);
            enqueueSnackbar(t("REQUEST_FAILED_PLEASE_CHECK_CONSOLE"), { 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                autoHideDuration: 3000
            });
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
                // 请求超时或失败时显示提示
                enqueueSnackbar(t("REQUEST_FAILED_PLEASE_CHECK_CONSOLE"), { 
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    autoHideDuration: 3000
                });
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
            // 请求超时或失败时显示提示
            enqueueSnackbar(t("REQUEST_FAILED_PLEASE_CHECK_CONSOLE"), { 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                autoHideDuration: 3000
            });
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
        // 登出时显示提示
        enqueueSnackbar(t("USER_LOGOUT") || "用户登出", { 
            variant: 'error',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
            },
            autoHideDuration: 2000
        });
        // 在移动端登出后关闭侧边栏
        if (isMobile) {
            setSidebarOpen(false);
        }
    };
    // #endregion

    // 侧边栏内容组件
    const SidebarContent = () => (
        <>
            {!isLoggedIn ? (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Button 
                        variant="contained" 
                        onClick={openLoginDialog}
                        fullWidth
                        sx={{ 
                            backgroundColor: '#FF0000', 
                            '&:hover': { backgroundColor: '#CC0000' },
                            padding: '8px 16px',
                            height: '35px'
                        }}
                    >
                        {t("LOGIN")}
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
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                mr: 1
                            }}
                        >
                            {t("NEW_CONVERSATION")}
                        </Button>
                        {isMobile && (
                            <IconButton 
                                onClick={() => setSidebarOpen(false)}
                                sx={{ 
                                    color: '#FFF',
                                    backgroundColor: '#333',
                                    borderRadius: '4px',
                                    '&:hover': { backgroundColor: '#444' }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        )}
                    </Box>
                    <Divider sx={{ backgroundColor: '#333' }} />
                    <Typography variant="h6" sx={{ 
                        p: isMobile ? 0.5 : 1, 
                        py: isMobile ? 0.5 : 1, 
                        color: '#FFF', 
                        fontSize: isMobile ? '0.9rem' : '1.25rem',
                        textAlign: 'center'
                    }}>
                        {t("HISTORY_CONVERSATION")}
                    </Typography>
                    <List sx={{ overflow: 'auto', flex: 1, padding: 0 }}>
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
                                            backgroundColor: 'rgba(255, 0, 0, 0.03)',
                                            '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.05)' },
                                            borderLeft: '4px solid #FF0000'
                                        },
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                        py: isMobile ? 0.5 : 1
                                    }}
                                >
                                    <ListItemText 
                                        primary={conv.title || t("UNNAMED_CONVERSATION")} 
                                        secondary={conv.isTemp ? t("UNSAVED_CONVERSATION") : new Date(conv.updatedAt).toLocaleString()}
                                        primaryTypographyProps={{ 
                                            color: currentConversationId === conv.id ? '#FF0000' : '#FFF',
                                            fontWeight: currentConversationId === conv.id ? 'bold' : 'normal',
                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            title: conv.title || t("UNNAMED_CONVERSATION")
                                        }}
                                        secondaryTypographyProps={{ 
                                            color: '#AAA',
                                            fontSize: isMobile ? '0.7rem' : '0.8rem'
                                        }}
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
                        backgroundColor: '#222',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: '#AAA', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                {t("LOGGED_IN")}：
                            </Typography>
                            <Typography sx={{ color: '#FF0000', fontWeight: 'bold', ml: 1, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                {loggedInUsername}
                            </Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            onClick={handleLogout}
                            size="small"
                            sx={{ 
                                borderColor: '#FF0000',
                                color: '#FF0000',
                                fontSize: isMobile ? '0.75rem' : '0.8rem',
                                '&:hover': { 
                                    borderColor: '#CC0000',
                                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                }
                            }}
                        >
                            {t("LOGOUT")}
                        </Button>
                    </Box>
                </>
            )}
        </>
    );

    return (
        <SnackbarProvider>
            <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 60px)', paddingTop: '60px' }}>
                {/* 桌面端侧边栏 */}
                {!isMobile && (
                    <div style={{ 
                        flex: sidebarCollapsed ? '0 0 auto' : 0.25, 
                        width: sidebarCollapsed ? '50px' : 'auto',
                        minWidth: sidebarCollapsed ? '50px' : '250px', 
                        height: 'calc(100% - 1px)', 
                        backgroundColor: '#1A1A1A', 
                        borderRight: '1px solid #333', 
                        borderTop: '1px solid #FF0000', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}>
                        {sidebarCollapsed ? (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                p: 1,
                                height: '100%'
                            }}>
                                <IconButton 
                                    onClick={() => setSidebarCollapsed(false)}
                                    sx={{ 
                                        color: '#FFF', 
                                        mb: 2,
                                        backgroundColor: '#333',
                                        '&:hover': { backgroundColor: '#444' }
                                    }}
                                >
                                    <ChevronRightIcon />
                                </IconButton>
                                {isLoggedIn && (
                                    <IconButton 
                                        onClick={createNewConversation}
                                        sx={{ 
                                            color: '#FFF', 
                                            mb: 2,
                                            backgroundColor: '#FF0000',
                                            '&:hover': { backgroundColor: '#CC0000' }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                )}
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ 
                                    p: 1,
                                    px: 1,
                                    pr: 1,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <IconButton 
                                        onClick={() => setSidebarCollapsed(true)}
                                        sx={{ 
                                            color: '#FFF', 
                                            backgroundColor: '#333',
                                            '&:hover': { backgroundColor: '#444' },
                                            borderRadius: '4px',
                                            height: '35px',
                                            width: '35px',
                                            mr: 1
                                        }}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    {isLoggedIn ? (
                                        <Button 
                                            variant="contained" 
                                            startIcon={<AddIcon />}
                                            onClick={createNewConversation}
                                            sx={{ 
                                                backgroundColor: '#FF0000', 
                                                '&:hover': { backgroundColor: '#CC0000' },
                                                flex: 1,
                                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                                height: '35px'
                                            }}
                                        >
                                            {t("NEW_CONVERSATION")}
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="contained" 
                                            onClick={openLoginDialog}
                                            sx={{ 
                                                backgroundColor: '#FF0000', 
                                                '&:hover': { backgroundColor: '#CC0000' },
                                                flex: 1,
                                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                                height: '35px'
                                            }}
                                        >
                                            {t("LOGIN")}
                                        </Button>
                                    )}
                                </Box>
                                {isLoggedIn && (
                                    <>
                                        <Divider sx={{ backgroundColor: '#333' }} />
                                        <Typography variant="h6" sx={{ 
                                            p: isMobile ? 0.5 : 1, 
                                            py: isMobile ? 0.5 : 1, 
                                            color: '#FFF', 
                                            fontSize: isMobile ? '0.9rem' : '1.25rem',
                                            textAlign: 'center'
                                        }}>
                                            {t("HISTORY_CONVERSATION")}
                                        </Typography>
                                        <List sx={{ overflow: 'auto', flex: 1, padding: 0 }}>
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
                                                                backgroundColor: 'rgba(255, 0, 0, 0.03)',
                                                                '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.05)' },
                                                                borderLeft: '4px solid #FF0000'
                                                            },
                                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                                            py: isMobile ? 0.5 : 1
                                                        }}
                                                    >
                                                        <ListItemText 
                                                            primary={conv.title || t("UNNAMED_CONVERSATION")} 
                                                            secondary={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span>{conv.isTemp ? t("UNSAVED_CONVERSATION") : new Date(conv.updatedAt).toLocaleString()}</span>
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setMenuAnchorEl(e.currentTarget);
                                                                            handleMenuOpen(e, conv.id)
                                                                        }}
                                                                        sx={{ 
                                                                            padding: '2px', 
                                                                            color: '#AAA',
                                                                            '&:hover': { color: '#FF0000' } 
                                                                        }}
                                                                    >
                                                                        <MoreHorizIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            }
                                                            primaryTypographyProps={{ 
                                                                color: currentConversationId === conv.id ? '#FF0000' : '#FFF',
                                                                fontWeight: currentConversationId === conv.id ? 'bold' : 'normal',
                                                                fontSize: isMobile ? '0.85rem' : '0.95rem',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                title: conv.title || t("UNNAMED_CONVERSATION")
                                                            }}
                                                            secondaryTypographyProps={{ 
                                                                color: '#AAA',
                                                                fontSize: isMobile ? '0.7rem' : '0.8rem'
                                                            }}
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
                                            backgroundColor: '#222',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ color: '#AAA', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                    {t("LOGGED_IN")}：
                                                </Typography>
                                                <Typography sx={{ color: '#FF0000', fontWeight: 'bold', ml: 1, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                    {loggedInUsername}
                                                </Typography>
                                            </Box>
                                            <Button 
                                                variant="outlined" 
                                                onClick={handleLogout}
                                                size="small"
                                                sx={{ 
                                                    borderColor: '#FF0000',
                                                    color: '#FF0000',
                                                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                                                    '&:hover': { 
                                                        borderColor: '#CC0000',
                                                        backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                                    }
                                                }}
                                            >
                                                {t("LOGOUT")}
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
                
                {/* 移动端侧边栏抽屉 */}
                {isMobile && (
                    <Drawer
                        anchor="left"
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        PaperProps={{
                            sx: {
                                width: '80%',
                                maxWidth: '300px',
                                backgroundColor: '#1A1A1A',
                                borderRight: '1px solid #333',
                                borderTop: '1px solid #FF0000',
                                display: 'flex',
                                flexDirection: 'column',
                                height: 'calc(100% - 60px)',
                                marginTop: '60px'
                            }
                        }}
                    >
                        <SidebarContent />
                    </Drawer>
                )}
                
                {/* 聊天界面 */}
                <div style={{ flex: 1, height: 'calc(100% - 1px)', maxWidth: '100vw', backgroundColor: '#1A1A1A', display: 'flex', flexDirection: 'column', borderTop: '1px solid #FF0000' }}>
                    {/* 消息显示区域 */}
                    <Box sx={{ 
                        flex: 1, 
                        p: isMobile ? 1 : 2, 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: isMobile ? 1 : 2
                    }}>
                        {messages.length === 0 && !isLoading && !isStreaming && (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                color: '#888'
                            }}>
                                <Typography variant={isMobile ? "body1" : "h6"} sx={{ textAlign: 'center', px: 2, fontSize: isMobile ? '0.9rem' : '1.25rem' }}>
                                    {isLoggedIn 
                                        ? currentConversationId 
                                            ? t("START_NEW_CONVERSATION") 
                                            : t("PLEASE_SELECT_OR_CREATE_NEW_CONVERSATION") 
                                        : t("PLEASE_LOGIN_FIRST")}
                                </Typography>
                                {isMobile && !isLoggedIn && (
                                    <Button 
                                        variant="contained" 
                                        startIcon={<MenuIcon />}
                                        onClick={() => setSidebarOpen(true)}
                                        sx={{ 
                                            mt: 2,
                                            backgroundColor: '#FF0000', 
                                            fontSize: '0.8rem',
                                            '&:hover': { backgroundColor: '#CC0000' }
                                        }}
                                    >
                                        {t("OPEN_MENU")}
                                    </Button>
                                )}
                            </Box>
                        )}
                        {messages.map((msg, index) => (
                            <Box 
                                key={index} 
                                sx={{ 
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: isMobile ? '100%' : '80%'
                                }}
                            >
                                <Paper 
                                    elevation={1} 
                                    sx={{ 
                                        p: isMobile ? 1.5 : 2, 
                                        backgroundColor: msg.role === 'user' ? '#333' : '#222', // 助手消息背景色更深
                                        color: '#FFF',
                                        borderRadius: '10px',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="markdown-body markdown-body-user" style={{ whiteSpace: 'pre-wrap' }}>
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]} 
                                                rehypePlugins={[rehypeHighlight]}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="markdown-body">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]} 
                                                    rehypePlugins={[rehypeHighlight]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.model && (
                                                <Typography sx={{ 
                                                    mt: 1, 
                                                    pt: 1, 
                                                    borderTop: '1px solid #444', 
                                                    color: '#888', 
                                                    fontSize: isMobile ? '0.65rem' : '0.75rem', 
                                                    textAlign: 'right' 
                                                }}>
                                                    模型: {msg.model}
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                        {/* 显示流式响应 */}
                        {isStreaming && streamingResponse && (
                            <Box 
                                sx={{ 
                                    alignSelf: 'flex-start',
                                    maxWidth: isMobile ? '100%' : '70%'
                                }}
                            >
                                <Paper 
                                    elevation={1} 
                                    sx={{ 
                                        p: isMobile ? 1.5 : 2, 
                                        backgroundColor: '#222', // 更深的背景色
                                        color: '#FFF',
                                        borderRadius: '10px'
                                    }}
                                >
                                     <div className="markdown-body">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]} 
                                            rehypePlugins={[rehypeHighlight]}
                                        >
                                            {streamingResponse}
                                        </ReactMarkdown>
                                    </div>
                                    {currentResponseModel && (
                                        <Typography sx={{ 
                                            mt: 1, 
                                            pt: 1, 
                                            borderTop: '1px solid #444', 
                                            color: '#888', 
                                            fontSize: isMobile ? '0.65rem' : '0.75rem', 
                                            textAlign: 'right' 
                                        }}>
                                            模型: {currentResponseModel}
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                        )}
                        {/* 显示加载指示器 */}
                        {(isLoading || isStreaming) && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                p: 2
                            }}>
                                <CircularProgress size={24} sx={{ color: '#FF0000' }} />
                                <Typography sx={{ ml: 2, color: '#AAA', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                                    {isStreaming ? '正在回复中...' : '加载中...'}
                                </Typography>
                            </Box>
                        )}
                        {/* 用于自动滚动到底部的空div */}
                        <div ref={messagesEndRef} />
                    </Box>
                    
                    {/* 消息输入区域 */}
                    <Box sx={{ 
                        p: isMobile ? 1 : 2, 
                        backgroundColor: '#222', 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        borderTop: '1px solid #333'
                    }}>
                        {isMobile && (
                            <IconButton 
                                onClick={() => setSidebarOpen(true)}
                                sx={{ 
                                    color: '#FFF', 
                                    mr: 1,
                                    backgroundColor: '#333',
                                    height: '40px',
                                    width: '40px',
                                    '&:hover': { backgroundColor: '#444' }
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <TextField
                            id='inputMessageTextField'
                            fullWidth
                            multiline
                            maxRows={isMobile ? 4 : 6}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={isLoggedIn ? (currentConversationId ? t("INPUT_MESSAGE") : t("PLEASE_SELECT_OR_CREATE_NEW_CONVERSATION")) : t("PLEASE_LOGIN_FIRST")}
                            variant="outlined"
                            disabled={isLoading || (!isLoggedIn || !currentConversationId)}
                            sx={{
                                mr: 1,
                                height: `${textFieldHeight}px`,
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    backgroundColor: '#333',
                                    height: '100%',
                                    fontSize: isMobile ? '0.85rem' : '1rem',
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
                                '& .MuiInputBase-input': {
                                    padding: isMobile ? '4px 8px' : '4px 4px', // 减小输入框的内边距
                                },
                            }}
                        />
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: `${textFieldHeight}px`,
                            width: isMobile ? '80px' : '120px'
                        }}>
                            <FormControl 
                                variant="outlined"
                                size="small"
                                disabled={isLoading || (!isLoggedIn || !currentConversationId)}
                                sx={{
                                    width: '100%',
                                    height: '32px',
                                    mb: 1,
                                    '& .MuiOutlinedInput-root': {
                                        color: '#FFF',
                                        backgroundColor: '#333',
                                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                                        height: '32px',
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
                                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                                        transform: isMobile ? 'translate(10px, 8px) scale(1)' : 'translate(14px, 8px) scale(1)',
                                    },
                                    '& .MuiInputLabel-shrink': {
                                        transform: isMobile ? 'translate(10px, -6px) scale(0.75)' : 'translate(14px, -6px) scale(0.75)',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#FF0000',
                                    },
                                    '& .MuiSelect-icon': {
                                        color: '#AAA',
                                    }
                                }}
                            >
                                <InputLabel id="model-select-label">{t("MODEL")}</InputLabel>
                                <Select
                                    id="model-select"
                                    labelId="model-select-label"
                                    label={t("MODEL")}
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                >
                                    {AVAILABLE_MODELS.map((model) => (
                                        <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button 
                                variant="contained"
                                onClick={sendMessage}
                                disabled={isLoading || !haveInputMessage || (!isLoggedIn || !currentConversationId)}
                                sx={{ 
                                    backgroundColor: '#FF0000', 
                                    color: '#FFF',
                                    width: '100%',
                                    height: `${textFieldHeight - 32 - 8}px`, // 减去下拉框高度和间距
                                    padding: 0,
                                    minWidth: isMobile ? '36px' : '64px',
                                    '&:hover': { backgroundColor: '#CC0000' },
                                    '&.Mui-disabled': { backgroundColor: '#555', color: '#888' }
                                }}
                            >
                                <SendIcon />
                            </Button>
                        </Box>
                    </Box>
                </div>

                {/* 会话操作菜单 */}
                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={() => setMenuAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            backgroundColor: '#222',
                            color: '#FFF',
                            border: '1px solid #333',
                            minWidth: '150px'
                        }
                    }}
                >
                    <MenuItem 
                        onClick={() => {
                            // 删除会话
                            setMenuAnchorEl(null);
                            // 这里添加删除逻辑
                            handleDeleteConversation();
                        }}
                        sx={{ 
                            fontSize: isMobile ? '0.85rem' : '0.9rem',
                            color: '#FF0000',
                            '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#FF0000', minWidth: '30px' }}>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        {t("DELETE")}
                    </MenuItem>
                </Menu>

                {/* 登录对话框 */}
                <Dialog 
                    open={loginDialogOpen} 
                    onClose={closeLoginDialog}
                    PaperProps={{
                        style: {
                            backgroundColor: '#222',
                            color: '#FFF',
                            borderRadius: '10px',
                            minWidth: isMobile ? '280px' : '300px',
                            margin: isMobile ? '16px' : 'auto'
                        }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid #333', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                        {t("USER_LOGIN")}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {loginError && (
                            <Typography color="error" sx={{ mb: 2, fontSize: isMobile ? '0.85rem' : '1rem' }}>
                                {loginError}
                            </Typography>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t("USERNAME")}
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    fontSize: isMobile ? '0.85rem' : '1rem',
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
                                    fontSize: isMobile ? '0.85rem' : '1rem',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#FF0000',
                                },
                            }}
                        />
                        <TextField
                            margin="dense"
                            label={t("PASSWORD")}
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#FFF',
                                    fontSize: isMobile ? '0.85rem' : '1rem',
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
                                    fontSize: isMobile ? '0.85rem' : '1rem',
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
                            sx={{ color: '#AAA', fontSize: isMobile ? '0.85rem' : '0.9rem' }}
                        >
                            {t("CANCEL")}
                        </Button>
                        <Button 
                            onClick={handleLogin} 
                            variant="contained"
                            disabled={isLoading}
                            sx={{ 
                                backgroundColor: '#FF0000', 
                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                '&:hover': { backgroundColor: '#CC0000' }
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : t("LOGIN")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </SnackbarProvider>
    );
};

export default AssistantPage;
