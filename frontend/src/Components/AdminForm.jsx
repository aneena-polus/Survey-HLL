import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addQuestion, resetQuestions, deleteQuestions } from '../redux/Slice/surveySlice';
import { deleteSurveyQuestion, saveSurveyQuestion, saveSurveyTitles } from '../services/userResponse';
import { TextField, Button, Checkbox, FormControlLabel, Card, Typography, Box, IconButton, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChoiceSelect from './ChoiceSelect';
import { ToastMessage } from '../common/Toast';

function AdminForm() {
    const { userData } = useContext(AuthContext);
    const dispatch = useDispatch();
    const [surveyDetails, setSurveyDetails] = useState([]);
    const questions = useSelector(state => state.questions.questions || []);
    const [title, setTitle] = useState('');
    const [nextFlag, setNextFlag] = useState(0);
    const [resetTrigger, setResetTrigger] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [isMandatory, setIsMandatory] = useState("F");
    const [questionType, setQuestionType] = useState('');
    const [lookupType, setLookupType] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const saveSurveyTitle = () => {
        const saveTitleObj = {
            title: title,
            created_by: userData.id
        };
        if (!saveTitleObj.title) {
            setErrors({ title: '*Title is required' });
            return;
        };
        saveSurveyTitles(saveTitleObj).then((response) => {
            setSurveyDetails(response.data.surveyFormId);
            setErrors({});
        });
        dispatch(resetQuestions());
        setNextFlag(1);
    };

    const deleteQuestion = (index) => {
        deleteSurveyQuestion(index).then(() => {
            dispatch(deleteQuestions(index));
            ToastMessage('Question Deleted Successfully!');
        });
    };

    const validate = (fields, requiredFields, setErrors) => {
        const newErrors = {};
        requiredFields.forEach(field => {
            if (!fields[field] || fields[field].trim() === '') {
                newErrors[field] = `${field} is required`;
            }
            if (field === 'lookup' && (fields['answerType'] == 'text' || fields['answerType'] == 'Yes/No' || fields['answerType'] == 'date')) {
                delete newErrors['lookup'];
            };
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddQuestion = () => {
        const requiredFields = ['question', 'answerType', 'lookup'];
        const newQ = {
            question: newQuestion,
            answerType: questionType,
            isMandatory: isMandatory,
            surveyId: surveyDetails,
            lookup: lookupType || null
        };
        if (!validate(newQ, requiredFields, setErrors)) return;
        saveSurveyQuestion(newQ).then((response) => {
            dispatch(addQuestion(response.data.data[0]));
        });
        setNewQuestion('');
        setIsMandatory("F");
        setQuestionType('');
        setLookupType('');
        setResetTrigger(prev => !prev);
    };

    const saveSurvey = () => {
        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
        navigate('/surveylist');
        dispatch(resetQuestions());
    };

    return (
        <Container maxWidth="lg">
            <Card className='p-4 mt-4'>
                <Typography variant="h5" gutterBottom>
                    {title || 'Create Survey'}
                </Typography>
                {!nextFlag && (
                    <TextField fullWidth label="Enter Form Title" value={title} className='mb-2'
                        onChange={(e) => setTitle(e.target.value)} error={Boolean(errors.title)} helperText={errors.title} />
                )}
                {!nextFlag ? (
                    <Button variant="contained" onClick={saveSurveyTitle}>
                        Next
                    </Button>
                ) : (
                    <>
                        <Box my={3}>
                            <Card variant="outlined" className='p-3'>
                                <Typography variant="subtitle1" gutterBottom>
                                    Enter a New Question <span className='text-danger'>*</span>
                                </Typography>
                                <TextField fullWidth value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                                    error={Boolean(errors.question)} helperText={errors.question ? 'Question is required' : ''}
                                    variant="standard" className='mb-2'
                                />
                                <ChoiceSelect setQuestionType={setQuestionType} setLookupType={setLookupType} errors={errors} resetTrigger={resetTrigger} />
                                <FormControlLabel
                                    control={<Checkbox checked={isMandatory === "T"} onChange={(e) => setIsMandatory(e.target.checked ? "T" : "F")} />}
                                    label="Is Mandatory?"
                                />
                                <Box textAlign="right">
                                    <Button variant="contained" color="success" onClick={handleAddQuestion}>
                                        Add Question
                                    </Button>
                                </Box>
                            </Card>
                        </Box>
                        {questions.map((q, index) => (
                            <Card key={index} variant="outlined" className='p-3 my-2'>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body1">
                                            {q.IS_MANDATORY === "T" && <span className='text-danger'>*</span>}{q.QUESTION}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Type:</strong> {q.ANSWER_TYPE}
                                        </Typography>
                                        {q.LOOKUP && (
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Lookup:</strong> {q.LOOKUP || 'N/A'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <IconButton color="error" onClick={() => deleteQuestion(q.QUESTION_ID)}>
                                        <DeleteIcon />
                                    </IconButton>
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
