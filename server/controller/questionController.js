import { connection } from "../config/connection.js";


const getQuestion = (req, res) => {
  const query = 'SELECT * FROM survey_question';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
    res.status(200).json({ questions: results });
  });
};

const answerTypes = async (req, res) => {
  const answerTypeQuery = 'SELECT * FROM answer_type';
  connection.query(answerTypeQuery, (err, answerTypesResults) => {
    if (err) {
      console.error('Error fetching answer types:', err);
      return res.status(500).json({ error: 'Failed to fetch answer types' });
    }

    const answerTypeIds = answerTypesResults
      .filter(at => at.TYPE === 'Checkbox' || at.TYPE === 'Dropdown' || at.TYPE === 'Radio')
      .map(at => at.ID);

    if (answerTypeIds.length > 0) {
      const lookupQuery = `SELECT DISTINCT ao.LOOKUP, ak.KEY FROM answer_option ao JOIN answer_key ak ON ao.LOOKUP = ak.ID ORDER BY ao.LOOKUP`;

      connection.query(lookupQuery, (err, lookupResults) => {
        if (err) {
          console.error('Error fetching lookup values:', err);
          return res.status(500).json({ error: 'Failed to fetch lookup values' });
        }
        res.status(200).json({
          answerTypes: answerTypesResults,
          lookupValues: lookupResults
        });
      });
    } else {
      res.status(200).json({
        answerTypes: answerTypesResults,
        lookupValues: []
      });
    }
  });
};



const saveQuestion = (req, res) => {
  const { question, answerType, isMandatory, surveyId, lookup } = req.body;

  if (!question || !answerType || !surveyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const answerTypeQuery = 'SELECT ID FROM answer_type WHERE TYPE = ?';
  connection.query(answerTypeQuery, [answerType], (err, result) => {
    if (err) {
      console.error('Error fetching answer type ID:', err);
      return res.status(500).json({ error: 'Error fetching answer type' });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: 'Invalid answer type' });
    }

    const answerTypeId = result[0].ID;

    const isMandatoryValue = isMandatory === 'T' ? 'T' : 'F';

    const query = `
      INSERT INTO survey_question 
      (SURVEY_ID, QUESTION, ANSWER_TYPE, LOOKUP, UPDATE_TIMESTAMP, UPDATE_PERSON, IS_MANDATORY, IS_NEW)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, 1)
    `;

    connection.query(query, [surveyId, question, answerTypeId, lookup || null, 1, isMandatoryValue], (err, result) => {
      if (err) {
        console.error('Error saving question:', err);
        return res.status(500).json({ error: 'Failed to save question' });
      }
      console.log(result);
      

      const questionId = result.insertId;
      const savedQuestion = {
        QUESTION_ID: questionId,
        SURVEY_ID: surveyId,
        QUESTION: question,
        ANSWER_TYPE: answerType,
        LOOKUP: lookup || null,
        IS_MANDATORY: isMandatoryValue
      };
      res.status(200).json({
        message: 'Question saved successfully',
        data: [savedQuestion]
      });
    });
  });
};


const getLookUpValues = async (req, res) => {
  const query = `
    SELECT ao.LOOKUP
    FROM answer_option ao
    JOIN answer_type at ON ao.ID = at.ID
    WHERE at.TYPE IN ('checkbox', 'dropdown');
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching lookup values:', err);
      return res.status(500).json({ error: 'Failed to fetch lookup values' });
    }
    res.status(200).json({ lookupValues: results });
  });
};


const removeQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
      if (!questionId) {
          return res.status(400).json({ error: 'Question ID is required' });
      }

      connection.beginTransaction((err) => {
          if (err) {
              console.error('Error starting transaction:', err);
              return res.status(500).json({ error: 'Error starting transaction' });
          }

          const deleteResponsesQuery = 'DELETE FROM survey_response WHERE QUESTION_ID = ?';
          connection.query(deleteResponsesQuery, [questionId], (err) => {
              if (err) {
                  console.error('Error deleting survey responses:', err);
                  return connection.rollback(() => {
                      res.status(500).json({ error: 'Error deleting survey responses' });
                  });
              }

              const deleteQuestionQuery = 'DELETE FROM survey_question WHERE ID = ?';
              connection.query(deleteQuestionQuery, [questionId], (err) => {
                  if (err) {
                      console.error('Error deleting question:', err);
                      return connection.rollback(() => {
                          res.status(500).json({ error: 'Error deleting question' });
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
                          message: 'Question and associated responses deleted successfully',
                      });
                  });
              });
          });
      });

  } catch (error) {
      console.error('Error while deleting question:', error);
      return res.status(500).json({ error: 'Failed to delete question' });
  }
};



const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { QUESTION, ANSWER_TYPE, LOOKUP, IS_MANDATORY } = req.body;

  if (!questionId || !QUESTION || !ANSWER_TYPE) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {

    const answerTypeQuery = 'SELECT ID FROM answer_type WHERE TYPE = ?';
    connection.query(answerTypeQuery, [ANSWER_TYPE], (err, result) => {
      if (err) {
        console.error('Error fetching answer type ID:', err);
        return res.status(500).json({ error: 'Error fetching answer type' });
      }

      if (result.length === 0) {
        return res.status(400).json({ error: 'Invalid answer type' });
      }

      const answerTypeId = result[0].ID;

      const isMandatoryValue = IS_MANDATORY === 'T' ? 'T' : 'F';

      const updateQuery = `
        UPDATE survey_question 
        SET QUESTION = ?, ANSWER_TYPE = ?, LOOKUP = ?, IS_MANDATORY = ?, UPDATE_TIMESTAMP = NOW()
        WHERE ID = ?
      `;

      connection.query(updateQuery, [QUESTION, answerTypeId, LOOKUP || null, isMandatoryValue, questionId], (err, results) => {
        if (err) {
          console.error('Error updating question:', err);
          return res.status(500).json({ error: 'Failed to update question' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Question not found' });
        }

        let QUESTION_ID = questionId

        res.status(200).json({
          message: 'Question updated successfully',
          updatedData: {
            QUESTION_ID,
            QUESTION,
            ANSWER_TYPE,
            LOOKUP,
            IS_MANDATORY: isMandatoryValue
          }
        });
      });
    });
  } catch (error) {
    console.error('Error while updating Question:', error);
    return res.status(500).json({ error: 'Error while updating Question' });
  }
};





export { saveQuestion, getQuestion, answerTypes, getLookUpValues, removeQuestion, updateQuestion };