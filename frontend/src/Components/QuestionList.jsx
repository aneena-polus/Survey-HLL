import React, { useEffect, useState } from "react";
import {
    Card, CardContent, Typography, IconButton, Modal, Box, TextField, Button, Stack, MenuItem,
    Select, FormControl, InputLabel, Container, FormControlLabel, Checkbox, FormHelperText
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import { deleteSurveyQuestion, editSurveyQuestion, editTitleSave, getOptionTypes, getQuestionsById, saveSurveyQuestion } from "../services/userResponse";
import { useDispatch, useSelector } from "react-redux";
import { addQuestion, deleteQuestions, editQuestions, editTitleValue, getQuestion } from "../redux/Slice/surveySlice";
import { useLocation } from "react-router-dom";
import { ToastMessage } from "../common/Toast";
import AlertDialogModal from "../common/Confirmation";

const QuestionList = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const location = useLocation();
    const data = location.state;
    const questions = useSelector(state => state.questions.questions);
    const title = useSelector(state => state.questions.title);
    const [editedQuestion, setEditedQuestion] = useState({});
    const [optionTypes, setOptionTypes] = useState([]);
    const [lookupTypes, setLookupTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [editFlag, setEditFlag] = useState(false);
    const [isDeleteConfirm, setDeleteConfirm] = useState(false);
    const [titleChange, setTitleChange] = useState(data?.survey_details.TITLE);
    const [deleteQuestionId, setDeleteQuestionId] = useState('');

    const handleEditClick = (question) => {
        setEditedQuestion(question);
        setOpen(true);
    };

    const handleAddClick = () => {
        setOpen(true);
    };

    useEffect(() => {
        if (data?.survey_details) {
            getQuestionsById(data.survey_details.ID)
                .then((response) => {
                    dispatch(editTitleValue(data?.survey_details.TITLE || ''))
                    dispatch(getQuestion(response.data.questions || []))
                }
                )
                .catch((error) => console.error('Error fetching products:', error));
        }
    }, [dispatch, data]);

    useEffect(() => {
        getOptionTypes().then((response) => {
            setOptionTypes(response.data.answerTypes);
            setLookupTypes(response.data.lookupValues);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedQuestion(prev => ({ ...prev, [name]: value }));
    };

    const validate = (fields, requiredFields, setErrors) => {
        const newErrors = {};
        requiredFields.forEach(field => {
            if (!fields[field] || fields[field].trim() === '') {
                newErrors[field] = `*${field} is required`;
            }
            if (field == 'LOOKUP' && (fields['ANSWER_TYPE'] == 'text' || fields['ANSWER_TYPE'] == 'Yes/No' || fields['ANSWER_TYPE'] == 'date')) {
                delete newErrors['LOOKUP'];
            };
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        let formattedQuestion = {};
        if (['text', 'date', 'Yes/No'].includes(editedQuestion.ANSWER_TYPE)) {
            formattedQuestion = {
                QUESTION: editedQuestion.QUESTION,
                ANSWER_TYPE: editedQuestion.ANSWER_TYPE,
                IS_MANDATORY: editedQuestion.IS_MANDATORY,
            };
        }
        else {
            formattedQuestion = editedQuestion;
        }
        const requiredFields = ['QUESTION', 'ANSWER_TYPE', 'LOOKUP'];
        if (!validate(formattedQuestion, requiredFields, setErrors)) return;
        if (editedQuestion.QUESTION_ID) {
            editSurveyQuestion(editedQuestion.QUESTION_ID, formattedQuestion).then((response) => {
                dispatch(editQuestions(response.data.updatedData));
                ToastMessage('Question Updated Successfully!');
            })
        }
        else {
            formattedQuestion = {
                question: editedQuestion.QUESTION,
                answerType: editedQuestion.ANSWER_TYPE,
                isMandatory: editedQuestion.IS_MANDATORY,
                surveyId: data?.survey_details.ID,
                lookup: editedQuestion.LOOKUP || null
            };
            saveSurveyQuestion(formattedQuestion).then((response) => {
                dispatch(addQuestion(response.data.data[0]));
            });
            ToastMessage('Question Added Successfully!');
        }
        setEditedQuestion({});
        setErrors({});
        setOpen(false);
    };

    const openDeleteConfirm = (questionId) => {
        setDeleteQuestionId(questionId);
        if (questions.length <= 1) {
            alert('Require atleast one question');
            return;
        }
        setDeleteConfirm(true);
    }

    const deleteQuestion = () => {
        deleteSurveyQuestion(deleteQuestionId).then(() => {
            dispatch(deleteQuestions(deleteQuestionId));
            setDeleteConfirm(false);
            ToastMessage('Question Deleted Successfully!');
        });
    };

    const editTitle = () => {
        const response = {
            surveyId: data.survey_details.ID,
            newTitle: titleChange
        }
        if (!response.newTitle) {
            setErrors({ title: '*Title is required' });
            return;
        };
        editTitleSave(response).then((res) => {
            dispatch(editTitleValue(res.data.newTitle));
            setEditFlag(false);
        });
    };

    return (
        <Container maxWidth="lg" className="p-4 mt-4">
            <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
                {!editFlag ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            {title}
                        </Typography>
                        <IconButton onClick={() => setEditFlag(true)} color="primary">
                            <EditIcon />
                        </IconButton>
                    </>
                ) : (
                    <Stack spacing={1} alignItems="end" width="100%">
                        <TextField fullWidth label="Enter Form Title" value={titleChange} helperText={errors.title}
                            onChange={(e) => setTitleChange(e.target.value)} error={Boolean(errors.title)} />
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" color="primary" onClick={() => { setEditFlag(false); setTitleChange(title); }}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={editTitle}>
                                Save
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
            <Button variant="contained" color="primary" sx={{ mb: 3 }} onClick={handleAddClick}>
                Add Question
            </Button>
            <Stack spacing={2}>
                {questions.map((question) => (
                    <Card key={question.QUESTION_ID} className="d-flex p-2 justify-content-between">
                        <CardContent className="d-flex flex-column">
                            <Typography variant="body1">
                                {question.IS_MANDATORY === "T" && <span className='text-danger'>*</span>}{question.QUESTION}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Data Type: </strong>{question.ANSWER_TYPE}
                            </Typography>
                            {question.LOOKUP && (
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Lookup: </strong>{question.LOOKUP}
                                </Typography>
                            )}
                        </CardContent>
                        <div className="d-flex justify-content-end align-items-center">
                            <IconButton onClick={() => handleEditClick(question)} color="primary">
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => openDeleteConfirm(question.QUESTION_ID)}>
                                <DeleteIcon />
                            </IconButton>
                            {isDeleteConfirm && (
                                <AlertDialogModal open={isDeleteConfirm} onClose={() => { setDeleteConfirm(false); setDeleteQuestionId('') }} onConfirm={() => deleteQuestion()} />
                            )}
                        </div>
                    </Card>
                ))}
                <Modal open={open} onClose={() => { setOpen(false); setEditedQuestion({}); }}>
                    <Box className='modal-container'>
                        <Typography variant="h6">{editedQuestion.QUESTION ? 'Edit' : 'Add'} Question</Typography>
                        <TextField fullWidth margin="normal" label="Question Text" name="QUESTION"
                            value={editedQuestion.QUESTION} onChange={handleChange} error={Boolean(errors.QUESTION)} helperText={errors.QUESTION ? '*Question is required' : ''} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Data Type</InputLabel>
                            <Select name="ANSWER_TYPE" value={editedQuestion.ANSWER_TYPE} onChange={handleChange} label="Data Type"
                                error={Boolean(errors.ANSWER_TYPE)}>
                                {optionTypes.map((option) => (
                                    <MenuItem key={option.ID} value={option.TYPE}>
                                        {option.TYPE}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.ANSWER_TYPE && <FormHelperText className="text-danger">*Data type is required</FormHelperText>}
                        </FormControl>
                        {(editedQuestion.ANSWER_TYPE == 'dropdown' || editedQuestion.ANSWER_TYPE == 'radio' || editedQuestion.ANSWER_TYPE == 'checkbox') && <FormControl fullWidth margin="normal">
                            <InputLabel>Lookup Type</InputLabel>
                            <Select name="LOOKUP" value={editedQuestion.LOOKUP} onChange={handleChange} label="Lookup Type"
                                error={Boolean(errors.LOOKUP)}>
                                {lookupTypes.map((lookup) => (
                                    <MenuItem key={lookup.LOOKUP} value={lookup.LOOKUP}>
                                        {lookup.LOOKUP}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.LOOKUP && <FormHelperText className="text-danger">*Lookup is required</FormHelperText>}
                        </FormControl>}
                        <FormControlLabel control={<Checkbox checked={editedQuestion.IS_MANDATORY === "T"} />}
                            label="Is Mandatory?" onChange={(e) => {
                                setEditedQuestion({
                                    ...editedQuestion, IS_MANDATORY: e.target.checked ? "T" : "F",
                                });
                            }} />
                        <Stack direction="row" spacing={2} justifyContent="flex-end" className="mt-2">
                            <Button onClick={() => { setOpen(false); setErrors({}); setEditedQuestion({}); }} color="error">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} variant="contained" color="primary">
                                Save
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            </Stack>
        </Container>
    );
};

export default QuestionList;
