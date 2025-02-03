import axios from 'axios';

export const getSurveyList = (userRole) => {
    return axios.get(`http://10.199.100.26:8000/api/getSurveyFormList`);
};

export const getSurveyQuestionsById = (data) => {
    return axios.post(`http://10.199.100.137:3000/getSurveyData`, data);
};

export const getmyformlist = () => {
    return axios.get(`http://10.199.100.137:3000/getSurveyList/${1}`);
};

export const getOptionTypes = () => {
    return axios.get(`http://10.199.100.26:8000/api/getanswerTypes`);
};

export const saveSurveyTitles = (data) => {
    return axios.post(`http://10.199.100.26:8000/api/saveSurveyForm`, data);
};

export const saveSurveyQuestion = (data) => {
    return axios.post(`http://10.199.100.26:8000/api/saveQuestion`, data);
};

export const deleteSurveyQuestion = (index) => {
    return axios.delete(`http://10.199.100.26:8000/api/removeQuestion/${index}`);
};

export const changeStatusSurvey = (surveyId, status) => {
    return axios.post(`http://10.199.100.26:8000/api/publishSurvey/${surveyId}`, { status: status });
};

export const getPublishedSurveyList = () => {
    return axios.get(`http://10.199.100.26:8000/api/getPublishedSurveys`);
};

export const getQuestionsById = (survey_id) => {
    return axios.get(`http://10.199.100.26:8000/api/getAllQuestionBySurveyId/${survey_id}`);
};

export const editSurveyQuestion = (questionId, question) => {
    return axios.put(`http://10.199.100.26:8000/api/updateQuestion/${questionId}`, question);
};

export const submitResponse = (response) => {
    return axios.post(`http://10.199.100.26:8000/api/saveSurveyAnswers`, response);
};

export const editTitleSave = (response) => {
    return axios.put(`http://10.199.100.26:8000/api/updateSurveyTitle`, response);
};
