import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// A connection pool is reused across requests instead of opening a new
// MySQL connection every time — much cheaper and the standard approach
// for a REST API talking to MySQL.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
