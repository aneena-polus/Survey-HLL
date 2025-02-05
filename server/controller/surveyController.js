import { connection } from "../config/connection.js";

export const getSurveyList = async (req, res) => {
    const { status } = req.params;
    const query = `
        SELECT * FROM survey sur LEFT JOIN person per ON 
        sur.UPDATE_PERSON = per.PERSON_ID where STATUS = ?`;
    connection.query(query, [status], (err, results) => {
        if (err) throw err;
        const responseData = results.map(item => ({
            ID: item.ID,
            TITLE: item.TITLE,
            CREATED_BY: item.CREATED_BY,
            UPDATE_PERSON: item.USERNAME,
            UPDATE_TIMESTAMP: item.UPDATE_TIMESTAMP,
            STATUS: item.STATUS,
        }));
        res.json(responseData);
    });
};

export const getSurveyData = async (req, res) => {
    const { id, user_id } = req.body;
    const checkForResponse = `SELECT * FROM survey_response WHERE survey_id = ? AND update_person = ?`;

    connection.query(checkForResponse, [id, user_id], (err, results) => {
        if (err) throw err;
        if (results.length < 1) {
            const query = `
            SELECT sq.ID, sq.QUESTION, sq.LOOKUP, sq.IS_MANDATORY, at.TYPE, 
            IF(sq.LOOKUP IS NOT NULL, 
                JSON_ARRAYAGG(JSON_OBJECT('optionId', ao.ID, 'optionText', ao.OPTION_TEXT)), 
                NULL
            ) AS OPTIONS
            FROM survey_question sq
            LEFT JOIN answer_type at ON sq.ANSWER_TYPE = at.ID
            LEFT JOIN answer_option ao ON sq.LOOKUP = ao.LOOKUP
            WHERE sq.SURVEY_ID = ? 
            GROUP BY sq.ID, sq.QUESTION, sq.LOOKUP, sq.IS_MANDATORY, at.TYPE`;

            connection.query(query, [id], (err, results) => {
                if (err) throw err;
                res.json(results);
            });
        } else {
            const query = `
            SELECT Q.ID, Q.QUESTION, 
            GROUP_CONCAT(DISTINCT SR.ANSWER ORDER BY SR.ANSWER ASC) AS ANSWER, 
            Q.LOOKUP, Q.IS_MANDATORY, at.TYPE, 
            IF(Q.LOOKUP IS NOT NULL, 
            JSON_ARRAYAGG(JSON_OBJECT('optionId', ao.ID, 'optionText', ao.OPTION_TEXT)), 
            NULL
            ) AS OPTIONS
            FROM survey_question Q
            LEFT JOIN survey_response SR ON SR.QUESTION_ID = Q.ID 
            AND SR.SURVEY_ID = ? AND SR.UPDATE_PERSON = ?
            LEFT JOIN answer_type at ON Q.ANSWER_TYPE = at.ID 
            LEFT JOIN answer_option ao ON Q.LOOKUP = ao.LOOKUP 
            WHERE Q.SURVEY_ID = ? 
            GROUP BY Q.ID, Q.QUESTION, Q.LOOKUP, Q.IS_MANDATORY, at.TYPE`;

            connection.query(query, [id, user_id, id], (err, results) => {
                if (err) throw err;
                res.json(results);
            });
        }
    });
};
