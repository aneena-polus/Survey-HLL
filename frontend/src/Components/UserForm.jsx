import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSurveyForm from '../hooks/customhooks';
import InputRenderer from './InputRenderer';
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { submitResponse } from '../services/userResponse';

const UserForm = () => {
    const { formData, responseData, handleResponseChange, data } = useSurveyForm();
    const navigate = useNavigate();

    const submitSurveyData = (e) => {
        e.preventDefault();
        const isValid = validateMandatoryFields(formData, responseData);
        if (!isValid) {
            alert("Please fill in all mandatory fields.");
            return; 
        }
        const response = {
            surveyId: data.survey_details.ID,
            answers: responseData
        }     
        submitResponse(response).then(()=>{
            navigate('/surveylist');
        })
    };

    const validateMandatoryFields = (questions, responses) => {
        return questions.every((question, index) => {
            return !question.IS_MANDATORY || (responses[index] && responses[index].answer);
        });
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
                            data = {data}
                            response={responseData[index] || {}}
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
