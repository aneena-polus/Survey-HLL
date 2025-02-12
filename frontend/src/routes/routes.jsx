import { Routes, Route } from "react-router-dom";
import Navbar from "../Components/Navbar";
import UserForm from "../Components/UserForm";
import UserView from "../Components/UserView";
import Login from "../Components/Login";
import AdminForm from "../Components/AdminForm";
import ViewQuestions from "../Components/QuestionList";
import LookupMaintenance from "../Components/LookupMaintenance";
import ProtectedRoute from "../config/protectedRoutes";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/newform" element={<ProtectedRoute><Navbar /><AdminForm /></ProtectedRoute>} />
            <Route path="/editform" element={<ProtectedRoute><Navbar /><ViewQuestions /></ProtectedRoute>} />
            <Route path="/surveylist" element={<ProtectedRoute><Navbar /><UserView /></ProtectedRoute>} />
            <Route path="/userform" element={<ProtectedRoute><Navbar /><UserForm /></ProtectedRoute>} />
            <Route path="/lookupmaintenance" element={<ProtectedRoute><Navbar /><LookupMaintenance /></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;
