import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { onLogout } from '../services/loginService';

const Navbar = () => {
    const navigate = useNavigate();

    const signOut = () => {
        onLogout().then(() => {
            localStorage.clear();
            navigate('/');
        });
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" className='flex-grow-1 fw-medium'>
                    Survey App
                </Typography>
                <Box className='d-flex gap-2'>
                    <Button color="inherit" onClick={() => navigate('/surveylist')}>
                        Home
                    </Button>
                    <Button color="inherit" onClick={signOut}>
                        Sign Out
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
