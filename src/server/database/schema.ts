import db from "./db.ts";

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      grade INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ne TEXT NOT NULL,
      description_en TEXT,
      description_ne TEXT,
      grade INTEGER, -- 0 for special courses like AI/Robotics
      category TEXT, -- 'curriculum', 'ai', 'robotics', 'cybersecurity'
      thumbnail TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      title_en TEXT NOT NULL,
      title_ne TEXT NOT NULL,
      content_en TEXT,
      content_ne TEXT,
      order_index INTEGER,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER,
      lesson_id INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      course_id INTEGER,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      certificate_code TEXT UNIQUE,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );
  `);
}
