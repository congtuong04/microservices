import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL successfully');
    connection.release();
  } catch (error) {
    console.error('MySQL connection error:', error);
  }
}