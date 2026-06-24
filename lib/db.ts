import mysql from "mysql2/promise";

const isDbConfigured = !!(
  process.env.MYSQL_HOST &&
  process.env.MYSQL_USER &&
  process.env.MYSQL_PASSWORD &&
  process.env.MYSQL_DATABASE
);

let pool: mysql.Pool | null = null;
let initialized = false;

export async function getDbPool(): Promise<mysql.Pool | null> {
  if (!isDbConfigured) return null;
  
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }

  if (!initialized && pool) {
    try {
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS cases (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          patientName VARCHAR(255) DEFAULT '',
          location VARCHAR(255) DEFAULT '',
          urgency VARCHAR(50) DEFAULT 'medium',
          description TEXT,
          goalAmount DOUBLE DEFAULT 0,
          raisedAmount DOUBLE DEFAULT 0,
          imageUrl LONGTEXT,
          documentUrl LONGTEXT,
          documentName VARCHAR(255) DEFAULT '',
          createdAt VARCHAR(255),
          isActive TINYINT(1) DEFAULT 1,
          showProgress TINYINT(1) DEFAULT 1
        )
      `);
      // Defensive schema migration: upgrade TEXT to LONGTEXT to support large Base64 uploads
      await connection.query("ALTER TABLE cases MODIFY imageUrl LONGTEXT");
      await connection.query("ALTER TABLE cases MODIFY documentUrl LONGTEXT");
      
      // Defensive schema migration: add showProgress column if it doesn't exist
      try {
        await connection.query("ALTER TABLE cases ADD COLUMN showProgress TINYINT(1) DEFAULT 1");
      } catch (err) {
        // Safe to ignore if column already exists
      }
      
      // Auto-create donations table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS donations (
          id VARCHAR(255) PRIMARY KEY,
          paymentId VARCHAR(255) DEFAULT '',
          orderId VARCHAR(255) DEFAULT '',
          name VARCHAR(255) DEFAULT '',
          email VARCHAR(255) DEFAULT '',
          phone VARCHAR(255) DEFAULT '',
          pan VARCHAR(255) DEFAULT '',
          message TEXT,
          amount DOUBLE DEFAULT 0,
          cause VARCHAR(255) DEFAULT '',
          createdAt VARCHAR(255)
        )
      `);

      // Auto-create gallery table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS gallery (
          id VARCHAR(255) PRIMARY KEY,
          src LONGTEXT,
          aspect VARCHAR(50) DEFAULT 'aspect-square',
          createdAt VARCHAR(255)
        )
      `);

      // Auto-create success_stories table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS success_stories (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          imageUrl LONGTEXT,
          createdAt VARCHAR(255)
        )
      `);
      connection.release();
      initialized = true;
      console.log("Database initialized successfully: tables synced.");
    } catch (err) {
      console.error("Database connection / initialization failed:", err);
    }
  }

  return pool;
}
