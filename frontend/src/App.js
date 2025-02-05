import './App.css';
import { Routes, Route } from "react-router-dom";
import Navbar from './Components/Navbar';
import UserForm from './Components/UserForm';
import UserView from './Components/UserView';
import Login from './Components/Login';
import AdminForm from './Components/AdminForm';
import ViewQuestions from './Components/QuestionList';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/newform" element={<><Navbar /><AdminForm /></>} />
                <Route path="/editform" element={<><Navbar /><ViewQuestions /></>} />
                <Route path="/surveylist" element={<><Navbar /><UserView /></>} />
                <Route path="/userform" element={<><Navbar /><UserForm /></>} />
            </Routes>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                draggable
                className= "custom-toast-container"
                theme="dark"
            />
        </>
    );
}

export default App;
