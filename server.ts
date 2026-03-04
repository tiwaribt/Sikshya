import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("sikshya.db");

// Initialize Database
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

// Seed initial data if empty
const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
if (courseCount.count === 0) {
  const insertCourse = db.prepare(`
    INSERT INTO courses (title_en, title_ne, description_en, description_ne, grade, category, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title_en, title_ne, content_en, content_ne, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Grade 1 Math
  const math1 = insertCourse.run(
    "Grade 1 Mathematics", "कक्षा १ गणित",
    "Basic numbers and counting for Grade 1.", "कक्षा १ का लागि आधारभूत संख्या र गणना।",
    1, "curriculum", "https://picsum.photos/seed/math1/400/300"
  ).lastInsertRowid;

  insertLesson.run(math1, "Introduction to Numbers", "संख्याहरूको परिचय", "# Numbers 1-10\nLet's learn to count!\n\n1. One (एक)\n2. Two (दुई)\n3. Three (तीन)", "# संख्या १-१०\nआउनुहोस् गणना गर्न सिकौं!\n\n१. एक\n२. दुई\n३. तीन", 1);

  // Grade 10 Science
  const science10 = insertCourse.run(
    "Grade 10 Science", "कक्षा १० विज्ञान",
    "Physics, Chemistry and Biology for SEE preparation.", "SEE तयारीका लागि भौतिक विज्ञान, रसायन विज्ञान र जीवविज्ञान।",
    10, "curriculum", "https://picsum.photos/seed/science10/400/300"
  ).lastInsertRowid;

  insertLesson.run(science10, "Force and Motion", "बल र चाल", "# Force\nForce is a push or pull upon an object...", "# बल\nबल भनेको कुनै वस्तुमा दिइने धक्का वा खिचाव हो...", 1);

  // AI Course
  const aiCourse = insertCourse.run(
    "Introduction to AI", "कृत्रिम बुद्धिमत्ताको परिचय",
    "Learn the basics of Artificial Intelligence and Machine Learning.", "कृत्रिम बुद्धिमत्ता र मेसिन लर्निङका आधारभूत कुराहरू सिक्नुहोस्।",
    0, "ai", "https://picsum.photos/seed/ai/400/300"
  ).lastInsertRowid;

  insertLesson.run(aiCourse, "What is AI?", "AI के हो?", "# What is AI?\nAI stands for Artificial Intelligence. It is the simulation of human intelligence processes by machines.", "# AI के हो?\nAI को अर्थ कृत्रिम बुद्धिमत्ता हो। यो मेसिनहरूद्वारा मानव बुद्धिमत्ता प्रक्रियाहरूको सिमुलेशन हो।", 1);
  insertLesson.run(aiCourse, "Machine Learning Basics", "मेसिन लर्निङका आधारभूत कुराहरू", "# Machine Learning\nML is a subset of AI that provides systems the ability to automatically learn and improve from experience.", "# मेसिन लर्निङ\nML AI को एक उपसमूह हो जसले प्रणालीहरूलाई अनुभवबाट स्वचालित रूपमा सिक्ने र सुधार गर्ने क्षमता प्रदान गर्दछ।", 2);

  // Robotics
  const roboticsCourse = insertCourse.run(
    "Robotics for Beginners", "शुरुवातकर्ताहरूको लागि रोबोटिक्स",
    "Build your first robot using Arduino and sensors.", "Arduino र सेन्सरहरू प्रयोग गरेर आफ्नो पहिलो रोबोट बनाउनुहोस्।",
    0, "robotics", "https://picsum.photos/seed/robotics/400/300"
  ).lastInsertRowid;

  insertLesson.run(roboticsCourse, "Introduction to Arduino", "Arduino को परिचय", "# Arduino Basics\nArduino is an open-source electronics platform based on easy-to-use hardware and software.", "# Arduino को आधारभूत कुराहरू\nArduino प्रयोग गर्न सजिलो हार्डवेयर र सफ्टवेयरमा आधारित खुला स्रोत इलेक्ट्रोनिक्स प्लेटफर्म हो।", 1);

  // Cyber Security
  const cyberCourse = insertCourse.run(
    "Cyber Security Basics", "साइबर सुरक्षाका आधारभूत कुराहरू",
    "Stay safe online and protect your digital identity.", "अनलाइन सुरक्षित रहनुहोस् र आफ्नो डिजिटल पहिचान सुरक्षित गर्नुहोस्।",
    0, "cybersecurity", "https://picsum.photos/seed/cyber/400/300"
  ).lastInsertRowid;

  insertLesson.run(cyberCourse, "Password Security", "पासवर्ड सुरक्षा", "# Strong Passwords\nLearn how to create and manage strong passwords.", "# बलियो पासवर्डहरू\nबलियो पासवर्डहरू कसरी बनाउने र व्यवस्थापन गर्ने सिक्नुहोस्।", 1);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/courses", (req, res) => {
    const grade = req.query.grade;
    const category = req.query.category;
    let query = "SELECT * FROM courses";
    const params = [];

    if (grade) {
      query += " WHERE grade = ?";
      params.push(grade);
    } else if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    const courses = db.prepare(query).all(...params);
    res.json(courses);
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
    const lessons = db.prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index").all(req.params.id);
    res.json({ ...course, lessons });
  });

  app.get("/api/lessons/:id", (req, res) => {
    const lesson = db.prepare("SELECT * FROM lessons WHERE id = ?").get(req.params.id);
    res.json(lesson);
  });

  app.post("/api/progress", (req, res) => {
    const { user_id, lesson_id } = req.body;
    try {
      db.prepare("INSERT INTO progress (user_id, lesson_id) VALUES (?, ?)").run(user_id, lesson_id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already completed or invalid data" });
    }
  });

  app.get("/api/user/:id/progress", (req, res) => {
    const progress = db.prepare("SELECT lesson_id FROM progress WHERE user_id = ?").all(req.params.id);
    res.json(progress);
  });

  app.post("/api/certificates", (req, res) => {
    const { user_id, course_id } = req.body;
    const code = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    try {
      db.prepare("INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)").run(user_id, course_id, code);
      res.json({ success: true, code });
    } catch (e) {
      res.status(400).json({ error: "Certificate already issued" });
    }
  });

  // Admin API Routes
  app.get("/api/admin/stats", (req, res) => {
    const stats = {
      courses: (db.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count,
      lessons: (db.prepare("SELECT COUNT(*) as count FROM lessons").get() as any).count,
      users: (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count,
      certificates: (db.prepare("SELECT COUNT(*) as count FROM certificates").get() as any).count,
    };
    res.json(stats);
  });

  app.post("/api/admin/courses", (req, res) => {
    const { title_en, title_ne, description_en, description_ne, grade, category, thumbnail } = req.body;
    const result = db.prepare(`
      INSERT INTO courses (title_en, title_ne, description_en, description_ne, grade, category, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title_en, title_ne, description_en, description_ne, grade, category, thumbnail);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/admin/courses/:id", (req, res) => {
    const { title_en, title_ne, description_en, description_ne, grade, category, thumbnail } = req.body;
    db.prepare(`
      UPDATE courses SET title_en = ?, title_ne = ?, description_en = ?, description_ne = ?, grade = ?, category = ?, thumbnail = ?
      WHERE id = ?
    `).run(title_en, title_ne, description_en, description_ne, grade, category, thumbnail, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/courses/:id", (req, res) => {
    db.prepare("DELETE FROM lessons WHERE course_id = ?").run(req.params.id);
    db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/lessons", (req, res) => {
    const { course_id, title_en, title_ne, content_en, content_ne, order_index } = req.body;
    const result = db.prepare(`
      INSERT INTO lessons (course_id, title_en, title_ne, content_en, content_ne, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(course_id, title_en, title_ne, content_en, content_ne, order_index);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/admin/lessons/:id", (req, res) => {
    const { title_en, title_ne, content_en, content_ne, order_index } = req.body;
    db.prepare(`
      UPDATE lessons SET title_en = ?, title_ne = ?, content_en = ?, content_ne = ?, order_index = ?
      WHERE id = ?
    `).run(title_en, title_ne, content_en, content_ne, order_index, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/lessons/:id", (req, res) => {
    db.prepare("DELETE FROM lessons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
