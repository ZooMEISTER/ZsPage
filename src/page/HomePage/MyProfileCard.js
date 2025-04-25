import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    Box, 
    Avatar, 
    Divider, 
    Grid, 
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useTranslation } from 'react-i18next';

// 自定义样式组件
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: 120,
    height: 120,
    border: '3px solid #FF0000',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    margin: '0 auto 16px auto',
    [theme.breakpoints.down('sm')]: {
        width: 100,
        height: 100,
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 16,
        background: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        border: '1px solid rgba(255, 0, 0, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
            margin: '12px',
            width: 'calc(100% - 24px)',
            maxHeight: 'calc(100% - 24px)'
        }
    }
}));

const InfoItem = styled(Box)(({ theme }) => ({
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        marginBottom: 8
    }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
    color: '#fff',
    background: 'rgba(255, 0, 0, 0.1)',
    margin: '0 8px',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(255, 0, 0, 0.3)',
        transform: 'translateY(-3px)'
    },
    [theme.breakpoints.down('sm')]: {
        margin: '0 4px',
        padding: '6px'
    }
}));

const MyProfileCard = ({ open, onClose }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            >
            <DialogTitle 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    pb: 1,
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 1.5 : 2
                }}
            >
                <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="div" 
                    sx={{ fontWeight: 'bold', color: '#FF0000' }}
                >
                    {t('WHO_AM_I')}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <Divider sx={{ borderColor: 'rgba(255, 0, 0, 0.2)' }} />
            
            <DialogContent sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 3 }}>
                <Grid container spacing={isMobile ? 2 : 3} sx={{width: '100%'}}>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center', minWidth: isMobile ? "100%" : "30%" }}>
                        <ProfileAvatar src="/path/to/avatar.jpg" alt="个人头像" />
                        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', mb: 1 }}>
                            ZOOMEISTER
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: isMobile ? 1 : 2 }}>
                            {t('BACKEND_DEVELOPER')}<br/>{t('GAME_LOVER')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: isMobile ? 1 : 2 }}>
                            <SocialButton 
                                aria-label="github" 
                                onClick={() => window.open('https://github.com/zoomeister', '_blank')}
                                size={isMobile ? "small" : "medium"}
                            >
                                <GitHubIcon fontSize={isMobile ? "small" : "medium"} />
                            </SocialButton>
                            <SocialButton 
                                aria-label="twitter" 
                                onClick={() => window.open('https://twitter.com/zoomeister64', '_blank')}
                                size={isMobile ? "small" : "medium"}
                            >
                                <TwitterIcon fontSize={isMobile ? "small" : "medium"} />
                            </SocialButton>
                            <SocialButton 
                                aria-label="email" 
                                onClick={() => window.open('https://steamcommunity.com/id/zoomeister64', '_blank')}
                                size={isMobile ? "small" : "medium"}
                            >
                                <SportsEsportsIcon fontSize={isMobile ? "small" : "medium"} />
                            </SocialButton>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ 
                                mb: isMobile ? 1 : 2, 
                                borderBottom: '2px solid #FF0000', 
                                pb: 1, 
                                display: 'inline-block' 
                            }}
                        >
                            {t('ABOUT_ME')}
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            {t('SELF_INTRODUCTION')}
                        </Typography>
                        
                        <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ 
                                mt: isMobile ? 2 : 3, 
                                mb: isMobile ? 1 : 2, 
                                borderBottom: '2px solid #FF0000', 
                                pb: 1, 
                                display: 'inline-block' 
                            }}
                        >
                            {t('ACHIEVEMENT')}
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                            <Grid item xs={12} sm={6}>
                                <InfoItem>
                                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                        • {t('RECHED')} B {t('RANK_ON_PERFECTWORLD_AT')} S5
                                    </Typography>
                                </InfoItem>
                                <InfoItem>
                                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                        • {t('RECHED')} C+ {t('RANK_ON_PERFECTWORLD_AT')} S18
                                    </Typography>
                                </InfoItem>
                                <InfoItem>
                                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                        • {t('RECHED')} B {t('RANK_ON_PERFECTWORLD_AT')} S19
                                    </Typography>
                                </InfoItem>
                            </Grid>
                        </Grid>
                        
                        <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ 
                                mt: isMobile ? 2 : 3, 
                                mb: isMobile ? 1 : 2, 
                                borderBottom: '2px solid #FF0000', 
                                pb: 1, 
                                display: 'inline-block' 
                            }}
                        >
                            {t('CONTACT_ME')}
                        </Typography>
                        <InfoItem>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                {t('EMAIL')}: zoomeister64@gmail.com
                            </Typography>
                        </InfoItem>
                    </Grid>
                </Grid>
            </DialogContent>
        </StyledDialog>
    );
};

export default MyProfileCard;
