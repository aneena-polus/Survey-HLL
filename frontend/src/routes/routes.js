import { Routes, Route } from "react-router-dom";
import Navbar from "../Components/Navbar";
import UserForm from "../Components/UserForm";
import UserView from "../Components/UserView";
import Login from "../Components/Login";
import AdminForm from "../Components/AdminForm";
import ViewQuestions from "../Components/QuestionList";
import LookupMaintenance from "../Components/LookupMaintenance";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/newform" element={<><Navbar /><AdminForm /></>} />
            <Route path="/editform" element={<><Navbar /><ViewQuestions /></>} />
            <Route path="/surveylist" element={<><Navbar /><UserView /></>} />
            <Route path="/userform" element={<><Navbar /><UserForm /></>} />
            <Route path="/lookupmaintenance" element={<><Navbar /><LookupMaintenance /></>} />
        </Routes>
    );
};

export default AppRoutes;
