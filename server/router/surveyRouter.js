import express from "express";
import { getSurveyList, getSurveyData }from '../controller/surveyController.js'
import { authorization } from "../middleware/authorization.js";
import { answerTypes, getQuestion, removeQuestion, saveQuestion, updateQuestion } from "../controller/questionController.js";
import { getAllQuestionBySurveyId, getOuestionFormById, getSurveyFormList, removeSurveyForm, saveSurveyForm, updateSurveyTitle } from "../controller/surveyFormController.js";
import saveSurveyResponses from "../controller/surveyResponse.js";
import { getPublishedSurveys, publishSurvey } from "../controller/publishSurvey.js";
import { copySurveyFormQuestions } from "../controller/copySurveyQuestions.js";
import { createLookupValues, deleteLookup, deleteOption, getAllLookups, getLookupOptionsById, updateLookupById, updateOption } from "../controller/lookupController.js";

const router = express();
// router.use(authorization);
router.get("/getSurveyList/:userRole",authorization, getSurveyList);
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

router.post('/copySurvey', authorization, copySurveyFormQuestions);

router.post('/createlookup', authorization, createLookupValues);
router.get('/getAllLookups', authorization, getAllLookups)
router.delete('/deleteLookup/:lookupId', authorization, deleteLookup);
router.put('/updateOption/:optionId', authorization, updateOption);
router.put('/updateOption', authorization, updateOption);
router.delete('/deleteOption/:optionId', authorization, deleteOption);
router.put('/updateLookupById', authorization, updateLookupById);
router.get('/getLookupOptionsById/:lookupId', authorization, getLookupOptionsById)

export default router;