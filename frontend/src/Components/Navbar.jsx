import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { onLogout } from '../services/loginService';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/Slice/surveySlice';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useContext(AuthContext);

    const signOut = () => {
        onLogout().then(() => {
            localStorage.clear();
            dispatch(logout());
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
                {userData.role == 1 &&    
                    <Button color="inherit" onClick={() => navigate('/lookupmaintenance')}>
                        Lookup Maintenance
                    </Button>}
                    <Button color="inherit" onClick={signOut}>
                        Sign Out
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
