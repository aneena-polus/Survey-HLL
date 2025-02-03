import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { changeStatusSurvey, getmyformlist, getPublishedSurveyList, getSurveyList } from '../services/userResponse';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, 
    Typography, Switch, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Badge from 'react-bootstrap/Badge';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function UserView() {
    const [rows, setRows] = useState([]);
    const navigate = useNavigate();
    const { userData, setUserData } = useContext(AuthContext);

    const gotoFormPage = (survey_details, action) => {
        if (action === 1) navigate(`/editform`, { state: { survey_details } });
        if (action === 2) navigate(`/userform`, { state: { survey_details } });
    };

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData)); 
        }
        if (userData.role === '1') {
            getSurveyList(userData.role)
                .then((response) => setRows(response.data.surveys))
                .catch((err) => console.log(err));
        } else {
            getmyformlist()
                .then((response) => setRows(response.data))
                .catch((err) => console.log(err));
        }
    }, [userData.role, navigate, setUserData]);

    const handleNewFormClick = () => navigate('/newform');

    const statusChange = (surveyId, currentStatus) => {
        const newStatus = currentStatus == '1' ? '0' : '1';
        changeStatusSurvey(surveyId, newStatus)
            .then(() => {
                setRows(prevRows =>
                    prevRows.map(row =>
                        row.ID === surveyId ? { ...row, STATUS: newStatus } : row
                    )
                );
            })
            .catch(err => console.log(err));
    };

    return (
        <div className='container my-4'>
            <div className='d-flex justify-content-between align-items-center'>
                <Typography variant="h5" gutterBottom>
                    Welcome, {userData.username}
                </Typography>
                {userData.role === '1' && (
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleNewFormClick}>
                        New Form
                    </Button>
                )}
            </div>
            <TableContainer component={Paper} className='mt-3 shadow'>
                <Table size="small">
                    <TableHead>
                        <TableRow className='bg-body-tertiary'>
                            <TableCell><b>Id</b></TableCell>
                            <TableCell><b>Survey Name</b></TableCell>
                            <TableCell><b>Update User</b></TableCell>
                            <TableCell><b>Create Timestamp</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={row.ID}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.TITLE}</TableCell>
                                <TableCell>{row.UPDATE_PERSON}</TableCell>
                                <TableCell>{new Date(row.UPDATE_TIMESTAMP).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                <TableCell>
                                {row.STATUS == '1' ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                </TableCell>
                                <TableCell>
                                    {userData.role == '1' && (
                                        <Tooltip title="Change Status">
                                            <Switch checked={row.STATUS == '1'} onChange={() => statusChange(row.ID, row.STATUS)}
                                            color="primary" size="small"/>
                                        </Tooltip>
                                    )}
                                    {userData.role === '1' && (
                                        <Tooltip title="View">
                                            <IconButton onClick={() => gotoFormPage(row, 1)} color="primary">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {userData.role == '2' && (
                                        <Button variant="outlined" size="small" onClick={() => gotoFormPage(row, 2)}>
                                            Fill Out Survey
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default UserView;
