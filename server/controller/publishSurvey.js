import { connection } from "../config/connection.js";


const publishSurvey = async (req, res) => {
    const { surveyId } = req.params; 
    const {status} = req.body;
    
    try {
 
      const query = 'UPDATE survey SET STATUS = ? WHERE ID = ?';
      connection.query(query, [status,surveyId], (err, results) => {
        if (err) {
          console.error('Error publishing survey:', err);
          return res.status(500).json({ error: 'Error publishing survey' });
        }
  
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Survey not found' });
        }

        const statusMessage = status === 1 ? 'Survey published successfully' : 'Survey inActivated';
  
        return res.status(200).json({ message: statusMessage });
      });
    } catch (err) {
      console.error('Error publishing survey:', err);
      return res.status(500).json({ error: 'Error publishing survey' });
    }
  };

  const getPublishedSurveys = async (req, res) => {
    try {
      const query = 'SELECT * FROM survey WHERE STATUS = 1';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching surveys:', err);
          return res.status(500).json({ error: 'Error fetching surveys' });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'No published surveys found' });
        }
        return res.status(200).json({
          message: 'Published surveys fetched successfully',
          surveys: results,
        });
      });
    } catch (err) {
      console.error('Error fetching surveys:', err);
      return res.status(500).json({ error: 'Error fetching surveys' });
    }
  };

  export {publishSurvey, getPublishedSurveys}