import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    questions: [],
    questionList: [],
    title: ''
};

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        getQuestion: (state, action) => {
            state.questions = action.payload;
        },
        addQuestion: (state, action) => {
            state.questions.push(action.payload);
        },
        resetQuestions: (state) => {
            state.questions = [];
        },
        deleteQuestions: (state, action) => {
            state.questions = state.questions.filter((question) => {
                return question.QUESTION_ID !== action.payload;
            });
        },
        editQuestions: (state, action) => {
            state.questions = state.questions.map((question) => {
                return question.QUESTION_ID == action.payload.QUESTION_ID ? action.payload : question
            });
        },
        editTitleValue: (state, action) => {
            state.title = action.payload;
        }
    }
});

export const { getQuestion, addQuestion, resetQuestions, deleteQuestions, editQuestions, editTitleValue } = questionSlice.actions;
export default questionSlice.reducer;
