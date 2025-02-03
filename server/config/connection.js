import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();  

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err.message);
        process.exit(1); 
    }
    console.log("Connected to the MySQL server.");
});

export { connection };
