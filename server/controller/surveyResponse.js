import { connection } from "../config/connection.js";

const saveSurveyResponses = async (req, res) => {
    const { surveyId, answers } = req.body;
    const user = results[0];
    const updatePerson = user.PERSON_ID;
    console.log("updatePerson",updatePerson);
    

    try {
        if (!surveyId || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: 'Invalid response data' });
        }

        const queries = answers.map(response => {
            let { questionId, answer } = response;

            console.log("Processing response:", response);

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
                ANSWER = VALUES(ANSWER), UPDATE_TIMESTAMP = NOW(), UPDATE_PERSON = ?`;

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
            .then(results => {
                res.status(200).json({
                    message: 'Survey answers saved successfully',
                    savedAnswers: results
                });
            })
            .catch(error => {
                console.error("Error saving survey responses:", error);
                res.status(500).json({ error: 'Error saving survey responses', details: error.message });
            });

    } catch (error) {
        console.error("Error in saveSurveyResponses:", error); 
        return res.status(500).json({ error: 'Failed while saving answers', details: error.message });
    }
};

  

export default saveSurveyResponses;
