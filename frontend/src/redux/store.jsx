import { configureStore } from '@reduxjs/toolkit';
import questionReducer from './Slice/surveySlice';  

export const store = configureStore({
    reducer: {
        questions: questionReducer
    }
});

export default store;