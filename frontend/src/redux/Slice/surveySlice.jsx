import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    questions: [],
    surveyList: [],
    title: '',
    description: '',
    lookupData: [],
    lookupOptions: []
};

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        getAllSurveyList: (state, action) => {
            state.surveyList = action.payload;
        },
        updateStatusSurveyList: (state, action) => {
            state.surveyList = state.surveyList.map(row =>
                row.ID === action.payload.surveyId ? { ...row, STATUS: action.payload.newStatus } : row
            );
        },
        copySurvey: (state, action) => {
            state.surveyList.push(action.payload);
        },
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
            state.title = action.payload.TITLE;
            state.description = action.payload.DESCRIPTION
        },
        getLookupData: (state, action) => {
            state.lookupData = action.payload;
        },
        addLookupData: (state, action) => {
            state.lookupData.push(action.payload);
        },
        deleteLookupData: (state, action) => {
            state.lookupData = state.lookupData.filter(opt => opt.lookupId !== action.payload);
        },
        getLookupOptions: (state, action) => {
            state.lookupOptions = action.payload;
        },
        editLookupTitle: (state, action) => {
            state.lookupData = state.lookupData.map((lookup) => {
                return lookup.lookupId == action.payload.lookupId ? action.payload : lookup
            });
        },
        addLookupOptions: (state, action) => {
            state.lookupOptions.push(action.payload);
        },
        saveAddLookupOptions: (state, action) => {
            const { optionId, options } = action.payload;
            const option = state.lookupOptions.find(opt => opt.optionId === optionId);
            if (option) {
                option.optionId = options.optionId;
                option.optionText = options.optionText;
                option.isNew = false
            }
        },
        editLookupOptions: (state, action) => {
            const { optionId, optionText } = action.payload;
            const option = state.lookupOptions.find(opt => opt.optionId === optionId);
            if (option) {
                option.optionText = optionText;
            }
        },
        deleteLookupOptions: (state, action) => {
            state.lookupOptions = state.lookupOptions.filter(opt => opt.optionId !== action.payload);
        },
        clearLookupOptions: (state, action) => {
            state.lookupOptions = [];
        },
        logout: () => initialState
    }
});

export const { getAllSurveyList, updateStatusSurveyList, copySurvey, getQuestion, addQuestion,
    resetQuestions, deleteQuestions, editQuestions, editTitleValue, getLookupData, addLookupData, deleteLookupData,
    getLookupOptions, editLookupTitle, addLookupOptions, saveAddLookupOptions, editLookupOptions, deleteLookupOptions, clearLookupOptions, logout } =
    questionSlice.actions;
export default questionSlice.reducer;
