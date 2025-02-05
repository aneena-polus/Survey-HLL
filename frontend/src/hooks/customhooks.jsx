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
                    questionId: null,
                    answer: item.TYPE == 'checkbox'
                        ? (item.ANSWER ? item.ANSWER.split(',').map((answer) => answer.trim()) : [])
                        : item.ANSWER
                }));
                setResponseData(initialResponses);
            })
            .catch((err) => {
                console.error(err);
                navigate('/')
            });
    }, [data.survey_details.ID, userData.userId, navigate]);

    const handleResponseChange = (index, questionId, answer) => {
        const updatedResponses = [...responseData];
        updatedResponses[index] = { questionId, answer };
        setResponseData(updatedResponses);
    };

    return { formData, responseData, handleResponseChange, data };
};

export default useSurveyForm;
