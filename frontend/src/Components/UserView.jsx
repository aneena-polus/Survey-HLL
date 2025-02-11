import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { changeStatusSurvey, copySurveyData, getSurveyList, getUserSurveyList } from '../services/userResponse';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton,
    Typography, Switch, Tooltip
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import Badge from 'react-bootstrap/Badge';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CopySurveyModal from './CopySurveyModal';
import { useDispatch, useSelector } from 'react-redux';
import { copySurvey, getAllSurveyList, updateStatusSurveyList } from '../redux/Slice/surveySlice';

function UserView() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const rows = useSelector(state => state.questions.surveyList || []);
    const { userData, setUserData } = useContext(AuthContext);
    const [openCopyModal, setOpenCopyModal] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState({});

    const gotoFormPage = (survey_details, action) => {
        if (action === 1) navigate(`/editform`, { state: { survey_details } });
        if (action === 2) navigate(`/userform`, { state: { survey_details } });
    };

    const handleCopySurveyClick = (survey) => {
        setSelectedSurvey(survey);
        setOpenCopyModal(true);
    };

    const handleCloseModal = () => {
        setOpenCopyModal(false);
        setSelectedSurvey({});
    };

    const handleCopySurvey = () => {
        const requestObj = {
            copySurveyId: selectedSurvey.ID,
            copyTitle: "Copy of " + selectedSurvey.TITLE,
            createdBy: userData.userId
        };
        copySurveyData(requestObj)
            .then((response) => {
                dispatch(copySurvey(response.data.survey));
            })
            .catch(err => console.log(err));
        handleCloseModal();
    };

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
        if (userData.role == '1') {
            getSurveyList(userData.role)
                .then((response) => {
                    dispatch(getAllSurveyList(response.data.surveys));
                })
                .catch((err) => console.log(err));
        }
        else if (userData.role == '2') {
            getUserSurveyList()
                .then((response) => {
                    dispatch(getAllSurveyList(response.data));
                })
                .catch((err) => console.log(err));
        }
    }, [userData.role, navigate, setUserData, dispatch]);

    const handleNewFormClick = () => navigate('/newform');

    const statusChange = (surveyId, currentStatus) => {
        const newStatus = currentStatus == '1' ? '0' : '1';
        changeStatusSurvey(surveyId, newStatus)
            .then(() => {
                dispatch(updateStatusSurveyList({ surveyId, newStatus }));
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
                        New Survey
                    </Button>
                )}
            </div>
            {rows.length > 0 ?
                <TableContainer component={Paper} className='mt-3 shadow'>
                    <Table size="small">
                        <TableHead>
                            <TableRow className='bg-body-tertiary'>
                                <TableCell><b>Id</b></TableCell>
                                <TableCell><b>Survey Name</b></TableCell>
                                <TableCell><b>Updated By</b></TableCell>
                                <TableCell><b>Created On</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={row.ID || index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.TITLE}</TableCell>
                                    <TableCell>{row.UPDATE_PERSON}</TableCell>
                                    <TableCell>{new Date(row.UPDATE_TIMESTAMP).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                    <TableCell>
                                        {userData.role == '1' && (row.STATUS == '1' ? <Badge bg="success" className='badge-style'>Active</Badge> : (<Badge className='badge-style' bg="secondary">Inactive</Badge>))}
                                        {userData.role == '2' && (row.USER_SURVEY_STATUS == 'completed' ? <Badge bg="success" className='badge-style'>Completed</Badge> : (<Badge bg="secondary" className='badge-style'>Pending</Badge>))}
                                    </TableCell>
                                    <TableCell>
                                        {userData.role == '1' && (
                                            <Tooltip title="Change Status">
                                                <Switch checked={row.STATUS == '1'} onChange={() => statusChange(row.ID, row.STATUS)}
                                                    color="primary" size="small" />
                                            </Tooltip>
                                        )}
                                        {userData.role === '1' && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => gotoFormPage(row, 1)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Copy">
                                                    <IconButton onClick={() => handleCopySurveyClick(row)} color="primary">
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {userData.role == '2' && row.USER_SURVEY_STATUS=='pending' && (
                                            <Button variant="outlined" size="small" onClick={() => gotoFormPage(row, 2)}>
                                                Fill Out Survey
                                            </Button>
                                        )}
                                        {userData.role == '2'&& row.USER_SURVEY_STATUS=='completed'  && (
                                            <Button variant="outlined" size="small" onClick={() => gotoFormPage(row, 2)}>
                                                View Responses
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> : <div>No data found</div>}
            <CopySurveyModal open={openCopyModal} handleClose={handleCloseModal} handleCopy={handleCopySurvey} survey={selectedSurvey.TITLE} />
        </div>
    );
}

export default UserView;
