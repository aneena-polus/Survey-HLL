import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addQuestion, resetQuestions, deleteQuestions, editQuestions } from '../redux/Slice/surveySlice';
import { deleteSurveyQuestion, editSurveyQuestion, saveSurveyQuestion, saveSurveyTitles } from '../services/userResponse';
import { TextField, Button, Checkbox, FormControlLabel, Card, Typography, Box, IconButton, Container, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import ChoiceSelect from './ChoiceSelect';
import { ToastMessage } from '../common/Toast';
import AlertDialogModal from '../common/Confirmation';

function AdminForm() {
    const { userData } = useContext(AuthContext);
    const dispatch = useDispatch();
    const questions = useSelector(state => state.questions.questions || []);
    const [surveyDetails, setSurveyDetails] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [nextFlag, setNextFlag] = useState(0);
    const [resetTrigger, setResetTrigger] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [isMandatory, setIsMandatory] = useState("F");
    const [questionType, setQuestionType] = useState('');
    const [lookupType, setLookupType] = useState('');
    const [editQuestionId, setEditQuestionId] = useState(null);
    const [errors, setErrors] = useState({});
    const [isDeleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState('');
    const navigate = useNavigate();

    const saveSurveyTitle = () => {
        const saveTitleObj = {
            title: title,
            created_by: userData.userId,
            ...(description && { description })
        };
        if (!saveTitleObj.title) {
            setErrors({ title: '* Title is required' });
            return;
        };
        saveSurveyTitles(saveTitleObj).then((response) => {
            setSurveyDetails(response.data.surveyFormId);
            setErrors({});
        });
        dispatch(resetQuestions());
        setNextFlag(1);
    };

    const deleteQuestion = () => {
        deleteSurveyQuestion(deleteQuestionId).then(() => {
            setDeleteConfirm(false);
            dispatch(deleteQuestions(deleteQuestionId));
        });
        setDeleteQuestionId('');
        ToastMessage('Question Deleted successfully!');
    };

    const validate = (fields, requiredFields, setErrors) => {
        const newErrors = {};
        requiredFields.forEach(field => {
            if (!fields[field] || fields[field].trim() === '') {
                newErrors[field] = `* ${field} is required`;
            }
            if (field == 'lookup' && (fields['answerType'] == 'Text' || fields['answerType'] == 'Yes/No' || fields['answerType'] == 'Date')) {
                delete newErrors['lookup'];
            };
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddQuestion = () => {
        const requiredFields = ['question', 'answerType', 'lookup'];
        const requestObj = {
            question: newQuestion,
            answerType: questionType,
            isMandatory: isMandatory,
            surveyId: surveyDetails,
            lookup: lookupType || null
        };
        if (!validate(requestObj, requiredFields, setErrors)) return;
        if (editQuestionId) {
            let formattedQuestion = {
                QUESTION: newQuestion,
                ANSWER_TYPE: questionType,
                IS_MANDATORY: isMandatory
            };
            if (!['Text', 'Date', 'Yes/No'].includes(questionType) && lookupType) {
                formattedQuestion.LOOKUP = lookupType;
            }
            editSurveyQuestion(editQuestionId, formattedQuestion).then((response) => {
                dispatch(editQuestions(response.data.updatedData));
                ToastMessage('Question Updated Successfully!');
            }).catch((error) => console.error('Error fetching Questions:', error));
            setEditQuestionId(null);
        }
        else {
            saveSurveyQuestion(requestObj).then((response) => {
                dispatch(addQuestion(response.data.data[0]));
                ToastMessage('Question Added Successfully!');
            }).catch((error) => console.error('Error fetching Questions:', error));
        }
        resetValues();
        setResetTrigger(prev => !prev);
    };

    const handleEditQuestion = (question) => {
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setNewQuestion(question.QUESTION);
        setQuestionType(question.ANSWER_TYPE);
        setLookupType(question.LOOKUP);
        setIsMandatory(question.IS_MANDATORY);
        setEditQuestionId(question.QUESTION_ID);
    };

    const saveSurvey = () => {
        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
        ToastMessage('Survey saved successfully!');
        navigate('/surveylist');
        dispatch(resetQuestions());
    };

    const resetValues = () => {
        setErrors({});
        setNewQuestion('');
        setIsMandatory("F");
        setEditQuestionId(null);
        setQuestionType('');
        setLookupType('');
    }

    const openDeleteConfirm = (questionId) => {
        setDeleteQuestionId(questionId);
        setDeleteConfirm(true);
    }

    return (
        <Container maxWidth="lg">
            <Card className='p-4 mt-4'>
                <div className='d-flex flex-column'>
                    <Typography variant="h5">
                        {title || 'Create Survey'}
                    </Typography>
                    <Typography variant="p" className='mb-3' gutterBottom>
                        {description}
                    </Typography>
                </div>
                {!nextFlag && (
                    <>
                        <InputLabel className="fw-bold"><span className='text-danger'>*</span> Title</InputLabel>
                        <TextField fullWidth value={title} className='mb-3'
                            onChange={(e) => setTitle(e.target.value)} error={Boolean(errors.title)} helperText={errors.title} />
                        <InputLabel className='fw-bold'>Description</InputLabel>
                        <TextField fullWidth className='mb-2' multiline rows={3}
                            onChange={(e) => setDescription(e.target.value)} error={Boolean(errors.description)} helperText={errors.description} />
                    </>
                )}
                {!nextFlag ? (
                    <Button variant="contained" onClick={saveSurveyTitle} className='mt-2'>
                        Next
                    </Button>
                ) : (
                    <>
                        <Box my={3}>
                            <Card variant="outlined" className='p-3'>
                                <InputLabel className="fw-bold"><span className='text-danger'>*</span> Enter a New Question</InputLabel>
                                <TextField fullWidth value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                                    error={Boolean(errors.question)} helperText={errors.question ? '* Question is required' : ''}
                                    variant="standard" className='mb-4 py-2' />
                                <ChoiceSelect questionType={questionType} lookupType={lookupType} setQuestionType={setQuestionType} setLookupType={setLookupType} errors={errors} resetTrigger={resetTrigger} />
                                <FormControlLabel control={<Checkbox checked={isMandatory === "T"} onChange={(e) => setIsMandatory(e.target.checked ? "T" : "F")} />}
                                    label="Is Mandatory?" />
                                <Box textAlign="right">
                                    {editQuestionId &&
                                        (<Button variant="outlined" color="success" onClick={resetValues} sx={{ mr: 1 }}>
                                            Cancel
                                        </Button>)}
                                    <Button variant="contained" color="success" onClick={handleAddQuestion}>
                                        {editQuestionId ? 'Edit Question' : 'Add Question'}
                                    </Button>
                                </Box>
                            </Card>
                        </Box>
                        {questions.map((q, index) => (
                            <Card key={index} variant="outlined" className='p-3 my-2'>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body1">
                                            {q.IS_MANDATORY === "T" && <span className='text-danger'>*</span>} {q.QUESTION}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Question Type:</strong> {q.ANSWER_TYPE}
                                        </Typography>
                                        {q.LOOKUP && (
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Lookup Type:</strong> {q.LOOKUP || 'N/A'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <IconButton color="primary" onClick={() => handleEditQuestion(q)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => openDeleteConfirm(q.QUESTION_ID)}>
                                            <DeleteIcon />
                                        </IconButton>
                                        {isDeleteConfirm && (
                                            <AlertDialogModal open={isDeleteConfirm} onClose={() => { setDeleteConfirm(false); setDeleteQuestionId('') }} onConfirm={() => deleteQuestion()} />
                                        )}
                                    </Box>

                                </Box>
                            </Card>
                        ))}
                        <Button variant="contained" className='mt-2' onClick={saveSurvey}>
                            Save Survey
                        </Button>
                    </>
                )}
            </Card>
        </Container>
    );
}

export default AdminForm;
