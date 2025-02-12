import { connection } from "../config/connection.js";

export const getSurveyList = async (req, res) => {
    const { status } = req.params;
    const userId = req.user.userId;

    const query = `
        SELECT 
            sur.ID, 
            sur.TITLE, 
            sur.CREATED_BY, 
            per.USERNAME, 
            sur.UPDATE_TIMESTAMP, 
            sur.STATUS,
            IF(
                COUNT(sr.ID) = COUNT(sq.ID) AND 
                NOT EXISTS (
                    SELECT 1 
                    FROM survey_response 
                    WHERE SURVEY_ID = sur.ID 
                    AND UPDATE_PERSON = ? 
                    AND ANSWER_STATUS = 'PENDING'
                ), 
                'completed', 
                'pending'
            ) AS user_survey_status
        FROM survey sur
        LEFT JOIN person per ON sur.UPDATE_PERSON = per.PERSON_ID
        LEFT JOIN survey_question sq ON sq.SURVEY_ID = sur.ID
        LEFT JOIN survey_response sr ON sr.SURVEY_ID = sur.ID AND sr.QUESTION_ID = sq.ID AND sr.UPDATE_PERSON = ?
        WHERE sur.STATUS = ?
        GROUP BY sur.ID, sur.TITLE, sur.CREATED_BY, per.USERNAME, sur.UPDATE_TIMESTAMP, sur.STATUS
    `;

    connection.query(query, [userId, userId, status], (err, results) => {
        if (err) {
            console.error("Error fetching survey list:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        const responseData = results.map(item => ({
            ID: item.ID,
            TITLE: item.TITLE,
            CREATED_BY: item.CREATED_BY,
            UPDATE_PERSON: item.USERNAME,
            UPDATE_TIMESTAMP: item.UPDATE_TIMESTAMP,
            STATUS: item.STATUS,
            USER_SURVEY_STATUS: item.user_survey_status 
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
        const fetchLookUpQuery = `
          SELECT sq.ID, sq.QUESTION, sq.LOOKUP, sq.IS_MANDATORY, at.TYPE, 
              IF(sq.LOOKUP IS NOT NULL, 
                  JSON_ARRAYAGG(JSON_OBJECT('optionId', ao.ID, 'optionText', ao.option_text)), 
                  NULL
              ) AS OPTIONS
          FROM survey_question sq
          LEFT JOIN answer_type at ON sq.ANSWER_TYPE = at.ID
          LEFT JOIN answer_key ak ON sq.LOOKUP = ak.KEY
          LEFT JOIN answer_option ao ON ak.ID = ao.LOOKUP
          WHERE sq.SURVEY_ID = ? 
          GROUP BY sq.ID, sq.QUESTION, sq.LOOKUP, sq.IS_MANDATORY, at.TYPE`;
  
        connection.query(fetchLookUpQuery, [id], (err, results) => {
          if (err) throw err;
          res.json(results);
        });
      } else {

        const fetchResponseQuery = `
          SELECT Q.ID, Q.QUESTION, 
              GROUP_CONCAT(DISTINCT SR.ANSWER ORDER BY SR.ANSWER ASC) AS ANSWER, 
              Q.LOOKUP, Q.IS_MANDATORY, at.TYPE, 
              IF(Q.LOOKUP IS NOT NULL, 
              JSON_ARRAYAGG(JSON_OBJECT('optionId', ao.ID, 'optionText', ao.option_text)), 
              NULL
              ) AS OPTIONS
          FROM survey_question Q
          LEFT JOIN survey_response SR ON SR.QUESTION_ID = Q.ID 
          AND SR.SURVEY_ID = ? AND SR.UPDATE_PERSON = ?
          LEFT JOIN answer_type at ON Q.ANSWER_TYPE = at.ID 
          LEFT JOIN answer_key ak ON Q.LOOKUP = ak.KEY 
          LEFT JOIN answer_option ao ON ak.ID = ao.LOOKUP 
          WHERE Q.SURVEY_ID = ? 
          GROUP BY Q.ID, Q.QUESTION, Q.LOOKUP, Q.IS_MANDATORY, at.TYPE`;
  
        connection.query(fetchResponseQuery, [id, user_id, id], (err, results) => {
          if (err) throw err;
          res.json(results);
        });
      }
    });
  };
