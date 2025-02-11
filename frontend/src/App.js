import AppRoutes from "./routes/routes.js";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <AppRoutes />
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                draggable
                className="custom-toast-container"
                theme="dark"
            />
        </>
    );
}

export default App;
