import { Typography } from '@mui/material';

import PepeFrog from '../../assest/pepe-frog.gif';

const Footer = () => {
    return(
        <div style={{
            display: 'flex',
            height: "65px",
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(to right, #ff8a00, #da1b60)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            borderTop: '1px solid red'
        }}>
            <Typography component="span" sx={{ mr: 1 }}>
                Made by
            </Typography>
            <img 
                src={PepeFrog} 
                alt="给爷" 
                style={{ height: '24px', verticalAlign: 'middle' }} 
            />
        </div>
    )
}

export default Footer