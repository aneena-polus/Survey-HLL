import { connection } from "../config/connection.js";

const saveSurveyResponses = async (req, res) => {
    const { surveyId, answers } = req.body;
    const updatePerson = req.user.userId;
    console.log("updatePerson", updatePerson);

    try {
        if (!surveyId || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: 'Invalid response data' });
        }


        const mandatoryQuery = `
            SELECT ID
            FROM survey_question
            WHERE SURVEY_ID = ? AND IS_MANDATORY = 'Y' AND IS_NEW = 0
        `;
        connection.query(mandatoryQuery, [surveyId], (err, mandatoryQuestions) => {
            if (err) {
                console.error("Error fetching mandatory questions:", err);
                return res.status(500).json({ error: 'Error fetching mandatory questions' });
            }


            const unansweredMandatoryQuestions = mandatoryQuestions.filter(question => {
                const answer = answers.find(a => a.questionId === question.ID);
                return !answer || answer.answer === null || answer.answer === '';
            });

            if (unansweredMandatoryQuestions.length > 0) {
                return res.status(400).json({
                    error: 'Please answer all mandatory questions',
                    unansweredQuestions: unansweredMandatoryQuestions
                });
            }

            const queries = answers.map(response => {
                let { questionId, answer } = response;

                if (!questionId) {
                    console.error("Invalid data detected. Missing questionId:", response);
                    return Promise.reject(new Error('Missing questionId'));
                }

                if (answer === undefined || answer === null || answer === '') {
                    answer = null;
                } else if (Array.isArray(answer)) {
                    answer = answer.join(', ');
                }

                const insertQuery = `
                    INSERT INTO survey_response (SURVEY_ID, QUESTION_ID, ANSWER, UPDATE_TIMESTAMP, UPDATE_PERSON)
                    VALUES (?, ?, ?, NOW(), ?)
                    ON DUPLICATE KEY UPDATE 
                    ANSWER = VALUES(ANSWER), UPDATE_TIMESTAMP = NOW(), UPDATE_PERSON = ?
                `;

                if (response.isNew && response.isNew === true) {
                    return Promise.resolve(); 
                }

                return new Promise((resolve, reject) => {
                    connection.query(insertQuery, [surveyId, questionId, answer, updatePerson, updatePerson], (err, result) => {
                        if (err) {
                            console.error("Database error:", err);
                            reject(err);
                        } else {
                            resolve({ questionId, answer });
                        }
                    });
                });
            });


            Promise.all(queries)
                .then(() => {

                    const checkSurveyStatusQuery = `SELECT COUNT(*) AS totalMandatory, 
                                            SUM(CASE WHEN SR.ANSWER IS NULL THEN 1 ELSE 0 END) AS unansweredMandatory
                                            FROM survey_question SQ
                                            LEFT JOIN survey_response SR ON SR.QUESTION_ID = SQ.ID AND SR.SURVEY_ID = ?
                                            WHERE SQ.SURVEY_ID = ? AND SQ.IS_MANDATORY = 'Y' AND SQ.IS_NEW = 0 AND SR.UPDATE_PERSON = ?`;

                    connection.query(checkSurveyStatusQuery, [surveyId, surveyId, updatePerson], (err, results) => {
                        if (err) {
                            console.error("Error checking survey status:", err);
                            return res.status(500).json({ error: 'Error checking survey status' });
                        }

                        const { totalMandatory, unansweredMandatory } = results[0];

                        console.log('totalMandatory:', totalMandatory);
                        console.log('unansweredMandatory:', unansweredMandatory);

                        if (unansweredMandatory > 0) {
                            return res.status(200).json({
                                message: 'Survey status is pending, please answer all mandatory questions.',
                                SURVEY_ID: surveyId,
                                USER_ID: updatePerson,
                                ANSWER_STATUS: 'pending',
                            });
                        }

                        const updateSurveyStatusQuery = `UPDATE survey_response SET ANSWER_STATUS = 'completed' WHERE SURVEY_ID = ? AND UPDATE_PERSON = ?`;


                        connection.query(updateSurveyStatusQuery, [surveyId, updatePerson], (err) => {
                            if (err) {
                                console.error("Error updating survey status:", err);
                                return res.status(500).json({ error: 'Error updating survey status' });
                            }

                            return res.status(200).json({
                                message: 'Survey answers saved and survey marked as completed',
                                SURVEY_ID: surveyId,
                                USER_ID: updatePerson,
                                ANSWER_STATUS: 'completed',
                            });
                        });

                    });

                })
                .catch(error => {
                    console.error("Error saving survey responses:", error);
                    res.status(500).json({ error: 'Error saving survey responses', details: error.message });
                });
        });

    } catch (error) {
        console.error("Error in saveSurveyResponses:", error);
        return res.status(500).json({ error: 'Failed while saving answers', details: error.message });
    }
};


export default saveSurveyResponses;
