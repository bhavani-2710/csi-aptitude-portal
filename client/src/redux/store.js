import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import questionReducer from "./questionSlice";
import userReducer from "./userSlice";
import examReducer from './ExamSlice';


const userPersistConfig = {
  key: "user",
  storage,
};
const QuestionPersistConfig = {
  key: "questions",
  storage,
};
const examPersistConfig = {
  key: "exam",

  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const persistedExamReducer = persistReducer(examPersistConfig, examReducer);
const persistedQuestionReducer = persistReducer(QuestionPersistConfig, questionReducer);

const store = configureStore({
  reducer: {
    questions: persistedQuestionReducer, // Persisted for questions
    user: persistedUserReducer, // Persisted user reducer
    exam: persistedExamReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
