import { Router } from "express";
import { CourseController } from "../controllers/CourseController.ts";
import { LessonController } from "../controllers/LessonController.ts";
import { AdminController } from "../controllers/AdminController.ts";
import db from "../database/db.ts";

const router = Router();

// Public Routes
router.get("/courses", CourseController.index);
router.get("/courses/:id", CourseController.show);
router.get("/lessons/:id", LessonController.show);

// Progress & Certificates
router.post("/progress", LessonController.updateProgress);
router.get("/user/:id/progress", LessonController.getProgress);

router.post("/certificates", (req, res) => {
  const { user_id, course_id } = req.body;
  const code = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  try {
    db.prepare("INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)").run(user_id, course_id, code);
    res.json({ success: true, code });
  } catch (e) {
    res.status(400).json({ error: "Certificate already issued" });
  }
});

router.get("/certificates/:user_id", (req, res) => {
  const certs = db.prepare(`
    SELECT c.*, co.title_en, co.title_ne 
    FROM certificates c 
    JOIN courses co ON c.course_id = co.id 
    WHERE c.user_id = ?
  `).all(req.params.user_id);
  res.json(certs);
});

// Admin Routes
router.get("/admin/stats", AdminController.stats);
router.get("/admin/users", AdminController.users);

router.post("/admin/courses", CourseController.store);
router.put("/admin/courses/:id", CourseController.update);
router.delete("/admin/courses/:id", CourseController.destroy);

router.post("/admin/lessons", LessonController.store);
router.put("/admin/lessons/:id", LessonController.update);
router.delete("/admin/lessons/:id", LessonController.destroy);

export default router;
