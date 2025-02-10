import { connection } from "../config/connection.js";


const copySurveyFormQuestions = async (req, res) => {

    const { copySurveyId, copyTitle, createdBy } = req.body;

    if (!copySurveyId) {
        return res.status(400).json({ error: 'Copied survey ID not found' })
    }

    try {

        const getTitleQuery = `SELECT ID, TITLE, CREATED_BY, UPDATE_TIMESTAMP, STATUS, UPDATE_PERSON FROM survey WHERE ID = ?`
        connection.query(getTitleQuery, [copySurveyId, copyTitle], (err, results) => {
            if (err) {
                console.error("Error fetching survey title:", err);
                return res.status(500).json({ error: 'Error fetching survey title' });
            }

            const getTitle = results[0];
            const newTitle = copyTitle || `${getTitle.TITLE} - Copy`;
            const insertTitleQuery = `INSERT INTO survey (TITLE, CREATED_BY, STATUS, UPDATE_PERSON, UPDATE_TIMESTAMP) VALUES (?, ?, ?, ?, NOW())`;
            connection.query(insertTitleQuery, [newTitle, createdBy, 0 , getTitle.UPDATE_PERSON], (err, results) => {
                if (err) {
                    console.error("Error inserting new survey:", err);
                    return res.status(500).json({ error: 'Error inserting new survey' });
                }
                const newSurveyId = results.insertId;
                const copyQuestionQuery = `INSERT INTO survey_question (SURVEY_ID, QUESTION, ANSWER_TYPE, LOOKUP, IS_MANDATORY)
                                           SELECT ?, QUESTION, ANSWER_TYPE, LOOKUP, IS_MANDATORY FROM survey_question WHERE SURVEY_ID = ?`;
                connection.query(copyQuestionQuery, [newSurveyId, copySurveyId], (err, results) => {
                    if (err) {
                        console.error("Error copying questions:", err);
                        return res.status(500).json({ error: 'Error copying questions' });
                    }

                    const getNewSurveyDataQuery = `
                        SELECT s.ID as surveyId, s.TITLE as surveyTitle, q.ID as questionId, q.QUESTION, q.ANSWER_TYPE, q.LOOKUP, q.IS_MANDATORY, 
                               p.USERNAME as updatePersonUsername
                        FROM survey s
                        LEFT JOIN survey_question q ON s.ID = q.SURVEY_ID
                        LEFT JOIN person p ON s.UPDATE_PERSON = p.PERSON_ID
                        WHERE s.ID = ?;
                    `;

                    connection.query(getNewSurveyDataQuery, [newSurveyId], (err, surveyData) => {
                        if (err) {
                            console.error("Error fetching new survey data:", err);
                            return res.status(500).json({ error: 'Error fetching new survey data' });
                        }

                        const surveyInfo = {
                            ID: newSurveyId,
                            TITLE: newTitle,
                            CREATED_BY: createdBy,
                            UPDATE_TIMESTAMP: new Date(),
                            STATUS: 0,
                            UPDATE_PERSON: surveyData[0].updatePersonUsername,
                            QUESTIONS: surveyData.map(q => ({
                                questionId: q.questionId,
                                questionText: q.QUESTION,
                                answerType: q.ANSWER_TYPE,
                                lookup: q.LOOKUP,
                                isMandatory: q.IS_MANDATORY
                            }))
                        };

                        return res.status(200).json({
                            message: 'Survey and questions copied successfully.',
                            survey: surveyInfo
                        });
                    })
                })
            })
        })

    } catch (error) {
        console.error("Error in copySurvey:", error);
        return res.status(500).json({ error: 'Internal server error', error });
    }
}


export { copySurveyFormQuestions }