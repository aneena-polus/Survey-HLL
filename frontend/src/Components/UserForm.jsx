import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSurveyForm from '../hooks/customhooks';
import InputRenderer from './InputRenderer';
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { submitResponse } from '../services/userResponse';

const UserForm = () => {
    const { formData, responseData, handleResponseChange, data } = useSurveyForm();
    const navigate = useNavigate();
    const [invalidFields, setInvalidFields] = useState([]);

    const submitSurveyData = (e) => {
        e.preventDefault();
        const invalidIndexes = validateMandatoryFields(formData, responseData);
        if (invalidIndexes.length > 0) {
            setInvalidFields(invalidIndexes);
            return; 
        }
        setInvalidFields([]);
        const response = {
            surveyId: data.survey_details.ID,
            answers: responseData
        }     
        submitResponse(response).then(()=>{
            navigate('/surveylist');
        })
    };

    const validateMandatoryFields = (questions, responses) => {
        return questions.reduce((acc, question, index) => {
            const response = responses[index]?.answer;
            if (question.IS_MANDATORY === 'T') {
                if (question.TYPE === 'checkbox' && (!Array.isArray(response) || response.length === 0)) {
                    acc.push(index);
                }
                else if (['text', 'date', 'radio', 'dropdown', 'Yes/No'].includes(question.TYPE) && (!response || response.trim() === '')) {
                    acc.push(index);
                }
            }
            return acc;
        }, []);
    };
    

    return (
        <Container maxWidth="lg" className='my-5'>
            <Paper elevation={3} className='p-4 rounded-2'>
                <Typography variant="h5" gutterBottom>
                    {data.survey_details.TITLE}
                </Typography>
                <Box component="form" onSubmit={submitSurveyData}>
                    {formData.map((question, index) => (
                        <InputRenderer 
                            key={question.id}
                            question={question}
                            index={index}
                            response={responseData[index] || {}}
                            isInvalid={invalidFields.includes(index)}
                            onChange={handleResponseChange}
                        />
                    ))}
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button type="submit" variant="contained" color="success">
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default UserForm;
