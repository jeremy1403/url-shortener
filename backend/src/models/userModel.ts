import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return (rows[0] as User) || null;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, passwordHash]
  );
  return result.insertId;
}
