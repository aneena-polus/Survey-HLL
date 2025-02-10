import { connection } from "../config/connection.js";

const saveSurveyForm = async (req, res) => {
    try {
        const { title, created_by, description } = req.body;

        if (!created_by) {
            console.error('Missing created_by in request body');
            return res.status(400).json({ error: 'created_by is required' });
        }

        const checkPerson = 'SELECT PERSON_ID, ROLE FROM person WHERE PERSON_ID = ?';
        connection.query(checkPerson, [created_by], (err, result) => {
            if (err) {
                console.error('Error while checking Person and Role', err);
                return res.status(500).json({ error: 'Failed to check person' });
            }

            if (result.length === 0) {
                console.error('Invalid person_id', err);
                return res.status(400).json({ error: 'Invalid person_Id' });
            }

            const person = result[0];
            const personRole = person.ROLE;
            let updatePerson = created_by;

            if (personRole == 1) {
                updatePerson = created_by;
            } else if (personRole == 2) {
                updatePerson = created_by;
            } else {
                updatePerson = created_by;
            }

            const insertQuery = `
                INSERT INTO survey (TITLE, CREATED_BY, UPDATE_PERSON, DESCRIPTION, UPDATE_TIMESTAMP)
                VALUES (?, ?, ?, ?, NOW())`;
            
            connection.query(insertQuery, [title, created_by, updatePerson, description], (err, result) => {
                if (err) {
                    console.error('Error saving survey form:', err);
                    return res.status(500).json({ error: 'Failed to save survey form' });
                }

                const surveyFormId = result.insertId;

                res.status(200).json({ message: 'Survey form saved successfully', surveyFormId: surveyFormId });
            });
        });
    } catch (error) {
        console.error('Error saving surveyForm:', error);
        return res.status(500).json({ error: 'Failed to save survey form' });
    }
};


const updateSurveyTitle = async (req, res) => {
    try {

        const {surveyId, newTitle, newDescription } = req.body;
        if (!surveyId || !newTitle) {
            return res.status(400).json({ error: 'Survey ID and new title are required' });
        }
        const updateQuery = 'UPDATE survey SET TITLE = ?, DESCRIPTION = ?, UPDATE_TIMESTAMP = NOW() WHERE ID = ?';
        connection.query(updateQuery, [newTitle, newDescription, surveyId], (err,result) => {
            if (err) {
                console.error('Error updating survey title:', err);
                return res.status(500).json({ error: 'Failed to update survey title' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Survey not found' });
            }
            res.status(200).json({ message: 'Survey title updated successfully', TITLE:newTitle, DESCRIPTION:newDescription });
        })

    } catch (error) {
        console.error('Error updating surveyForm title:', err);
        return res.status(500).json({ error: 'Failed to update survey form title' });
    }
}


const getSurveyFormList = async (req, res) => {
    try {

        const userId = req.user.userId;
        console.log("User from request:", req.user);

        
        const query = `
            SELECT s.ID, s.TITLE, s.CREATED_BY, s.UPDATE_TIMESTAMP, s.STATUS, s.DESCRIPTION, p.USERNAME AS UPDATE_PERSON
            FROM survey s
            JOIN survey_question sq ON s.ID = sq.SURVEY_ID
            LEFT JOIN person p ON s.UPDATE_PERSON = p.PERSON_ID
             WHERE s.CREATED_BY = ? 
            GROUP BY s.ID
        `;
        connection.query(query,[userId], (err, results) => {
            if (err) {
                console.error('Error fetching survey forms:', err);
                return res.status(500).json({ error: 'Failed to fetch survey forms' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No surveys found with questions' });
            }
            res.status(200).json({ surveys: results });
        });
    } catch (error) {
        console.error('Error fetching survey form list:', error);
        return res.status(500).json({ error: 'Failed to fetch survey form list' });
    }

}

const getAllQuestionBySurveyId = async (req, res) => {
    const { surveyId } = req.params;
    try {
        if (!surveyId) {
            return res.status(400).json({ error: 'SurveyId not found' })
        }
        const query = `SELECT 
                q.ID AS QUESTION_ID,
                q.QUESTION,
                at.TYPE AS ANSWER_TYPE,
                q.LOOKUP,
                q.IS_MANDATORY
            FROM survey_question q
            LEFT JOIN answer_type at ON q.ANSWER_TYPE = at.ID
            WHERE q.SURVEY_ID = ?`;
        connection.query(query, [surveyId], (err, results) => {
            if (err) {
                console.error('Error fetching questions:', err);
                return res.status(500).json({ error: 'Failed to fetch questions' });
            }
            res.status(200).json({
                message: 'Questions fetched successfully',
                questions: results
            });
        });
    } catch (error) {
        console.error('Error fetching survey form :', error);
        return res.status(500).json({ error: 'Failed to fetch survey form By ID' });
    }
}


const removeSurveyForm = async (req, res) => {
    const { surveyId } = req.params;
    try {

        if (!surveyId) {
            return res.status(400).json({ error: 'Survey ID is required' });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Error starting transaction' });
            }

            const deleteResponsesQuery = 'DELETE FROM survey_response WHERE SURVEY_ID = ?';
            connection.query(deleteResponsesQuery, [surveyId], (err) => {
                if (err) {
                    console.error('Error deleting survey responses:', err);
                    return res.status(500).json({ error: 'Error deleting survey responses' });
                }

                const deleteQuestionsQuery = 'DELETE FROM survey_question WHERE SURVEY_ID = ?';
                connection.query(deleteQuestionsQuery, [surveyId], (err) => {
                    if (err) {
                        console.error('Error deleting survey questions:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Error deleting survey questions' });
                        });
                    }
                    const deleteSurveyQuery = 'DELETE FROM survey WHERE ID = ?';
                    connection.query(deleteSurveyQuery, [surveyId], (err) => {
                        if (err) {
                            console.error('Error deleting survey:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error deleting survey' });
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Error committing transaction' });
                                });
                            }
                            res.status(200).json({
                                message: 'Survey Form deleted successfully',
                            });
                        });
                    });
                });
            });
        })
    } catch (error) {
        console.error('Error while deleting survey form :', error);
        return res.status(500).json({ error: 'Failed to delete survey form By ID' });
    }
};

const getOuestionFormById = async (req, res) => {

    const { surveyId } = req.params

    try {

        if (!surveyId) {
            return res.status(400).json({ error: 'SurveyId not found' })
        }
        const fetchquery = `SELECT q.ID AS question_id, q.QUESTION, q.ANSWER_TYPE, q.LOOKUP, q.IS_MANDATORY
                       FROM survey_question q WHERE q.SURVEY_ID = ?`;
        connection.query(fetchquery, [surveyId], async (err, results) => {
            if (err) {
                console.error('Error fetching survey questions:', err);
                return res.status(500).json({ error: 'Error fetching survey questions' });
            }
            const fetchQuestionWithOptions = await Promise.all(results.map(async (question) => {
                let answerTypeString = '';
                switch (question.ANSWER_TYPE) {
                    case 1:
                        answerTypeString = 'text';
                        break;
                    case 2:
                        answerTypeString = 'date';
                        break;
                    case 3:
                        answerTypeString = 'checkbox';
                        break;
                    case 4:
                        answerTypeString = 'Yes/No';
                        break;
                    case 5:
                        answerTypeString = 'dropdown';
                        break;
                    default:
                        answerTypeString = 'unknown';
                        break;
                }
                question.ANSWER_TYPE = answerTypeString;
                if ((question.ANSWER_TYPE === 'checkbox' || question.ANSWER_TYPE === 'dropdown') && question.LOOKUP) {
                    const fetchOptions = 'SELECT option_text FROM answer_option WHERE LOOKUP IN (?)';
                    return new Promise((resolve, reject) => {
                        connection.query(fetchOptions, [question.LOOKUP.split(',')], (err, options) => {
                            if (err) {
                                console.error('Error fetching lookup options:', err);
                                reject({ ...question, options: [] });
                            } else {
                                resolve({ ...question, options });
                            }
                        });
                    })
                }
                return question;
            }))
            res.status(200).json({
                message: 'Questions fetched successfully',
                questions: fetchQuestionWithOptions
            });
        })

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch Question Form' })
    }
}



export { getSurveyFormList, saveSurveyForm, getAllQuestionBySurveyId, removeSurveyForm, getOuestionFormById, updateSurveyTitle };