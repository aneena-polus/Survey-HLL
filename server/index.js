import express from "express";
import { connection } from "./config/connection.js";
import cors from "cors";
import cookieParser from 'cookie-parser';
import loginRouter from "./router/loginRouter.js";
import surveyRouter from "./router/surveyRouter.js";

const app = express();
app.use(express.json());
app.use(cors({origin:['http://10.199.100.26:3000','http://10.199.100.137:3001'], credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'],}));

app.use(cookieParser());



app.use("/", loginRouter); 
app.use("/api/auth", surveyRouter)





app.listen(8000 ,() => {
    console.log("Server is running on port 8000");
});

