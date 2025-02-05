import express from "express";
import { getSurveyList, getSurveyData }from '../controller/surveyController.js'
import { authorization } from "../middleware/authorization.js";
import { answerTypes, getQuestion, removeQuestion, saveQuestion, updateQuestion } from "../controller/questionController.js";
import { getAllQuestionBySurveyId, getOuestionFormById, getSurveyFormList, removeSurveyForm, saveSurveyForm, updateSurveyTitle } from "../controller/surveyFormController.js";
import saveSurveyResponses from "../controller/surveyResponse.js";
import { getPublishedSurveys, publishSurvey } from "../controller/publishSurvey.js";

const router = express();
// router.use(authorization);
router.get("/getSurveyList/:status",authorization, getSurveyList);
router.post("/getSurveyData",authorization, getSurveyData);


router.post('/saveQuestion',authorization, saveQuestion);
router.get('/getQuestions',authorization, getQuestion);
router.delete('/removeQuestion/:questionId', removeQuestion);
router.get('/getanswerTypes', answerTypes);
router.put('/updateQuestion/:questionId', updateQuestion);



router.get('/getSurveyFormList',authorization, getSurveyFormList);
router.post('/saveSurveyForm',authorization, saveSurveyForm);
router.put('/updateSurveyTitle',authorization, updateSurveyTitle);
router.get('/getAllQuestionBySurveyId/:surveyId', authorization, getAllQuestionBySurveyId);
router.delete('/removeSurveyForm/:surveyId',authorization, removeSurveyForm);
router.get('/getOuestionFormById/:surveyId',authorization, getOuestionFormById);


router.post('/publishSurvey/:surveyId',authorization, publishSurvey);
router.get('/getPublishedSurveys',authorization, getPublishedSurveys);

router.post('/saveSurveyAnswers', authorization, saveSurveyResponses);

export default router;