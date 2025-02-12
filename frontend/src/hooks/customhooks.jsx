import { useContext, useEffect, useState } from 'react';
import { getSurveyQuestionsById } from '../services/userResponse';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const useSurveyForm = () => {
    const [formData, setFormData] = useState([]);
    const [responseData, setResponseData] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);
    const data = location.state;

    useEffect(() => {
        const response = {
            id: data.survey_details.ID,
            user_id: userData.userId
        }
        getSurveyQuestionsById(response)
            .then((response) => {
                setFormData(response.data);
                const initialResponses = response.data.map((item) => ({
                    questionId: item.ID,
                    answer: item.TYPE == 'Checkbox'
                        ? (item.ANSWER ? item.ANSWER.split(',').map((answer) => answer.trim()) : [])
                        : item.ANSWER,
                    actionType: item.ANSWER ? 'U' : 'I'
                }));
                setResponseData(initialResponses);
            })
            .catch((err) => {
                console.error(err);
                navigate('/')
            });
    }, [data.survey_details.ID, userData.userId, navigate]);

    const handleResponseChange = (index, questionId, answer, actionType) => {
        const updatedResponses = [...responseData];
        updatedResponses[index] = { questionId, answer, actionType };
        setResponseData(updatedResponses);
    };

    return { formData, responseData, handleResponseChange, data };
};

export default useSurveyForm;
