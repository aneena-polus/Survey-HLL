import express from "express";
import { getSurveyList, getSurveyData }from '../controller/surveyController.js'
import { authorization } from "../middleware/authorization.js";

const router = express();
// router.use(authorization);
router.get("/getSurveyList/:userRole", getSurveyList);
router.post("/getSurveyData", getSurveyData);

export default router;