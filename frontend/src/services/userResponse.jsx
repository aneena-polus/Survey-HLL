import axiosInstance from "../config/axiosConfig";

export const getSurveyList = (userRole) => {
    return axiosInstance.get(`api/auth/getSurveyFormList`);
};

export const getSurveyQuestionsById = (data) => {
    return axiosInstance.post(`api/auth/getSurveyData`, data);
};

export const getmyformlist = () => {
    return axiosInstance.get(`api/auth/getSurveyList/${1}`);
};

export const getOptionTypes = () => {
    return axiosInstance.get(`api/auth/getanswerTypes`);
};

export const saveSurveyTitles = (data) => {
    return axiosInstance.post(`api/auth/saveSurveyForm`, data);
};

export const saveSurveyQuestion = (data) => {
    return axiosInstance.post(`api/auth/saveQuestion`, data);
};

export const deleteSurveyQuestion = (index) => {
    return axiosInstance.delete(`api/auth/removeQuestion/${index}`);
};

export const changeStatusSurvey = (surveyId, status) => {
    return axiosInstance.post(`api/auth/publishSurvey/${surveyId}`, { status: status });
};

export const getPublishedSurveyList = () => {
    return axiosInstance.get(`api/auth/getPublishedSurveys`);
};

export const getQuestionsById = (survey_id) => {
    return axiosInstance.get(`api/auth/getAllQuestionBySurveyId/${survey_id}`);
};

export const editSurveyQuestion = (questionId, question) => {
    return axiosInstance.put(`api/auth/updateQuestion/${questionId}`, question);
};

export const submitResponse = (response) => {
    return axiosInstance.post(`api/auth/saveSurveyAnswers`, response);
};

export const editTitleSave = (response) => {
    return axiosInstance.put(`api/auth/updateSurveyTitle`, response);
};
