import { Request, Response } from "express";
import db from "../database/db.ts";

export class LessonController {
  static show(req: Request, res: Response) {
    const lesson = db.prepare("SELECT * FROM lessons WHERE id = ?").get(req.params.id);
    res.json(lesson);
  }

  static store(req: Request, res: Response) {
    const { course_id, title_en, title_ne, content_en, content_ne, order_index } = req.body;
    const result = db.prepare(`
      INSERT INTO lessons (course_id, title_en, title_ne, content_en, content_ne, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(course_id, title_en, title_ne, content_en, content_ne, order_index);
    res.json({ id: result.lastInsertRowid });
  }

  static update(req: Request, res: Response) {
    const { title_en, title_ne, content_en, content_ne, order_index } = req.body;
    db.prepare(`
      UPDATE lessons SET title_en = ?, title_ne = ?, content_en = ?, content_ne = ?, order_index = ?
      WHERE id = ?
    `).run(title_en, title_ne, content_en, content_ne, order_index, req.params.id);
    res.json({ success: true });
  }

  static destroy(req: Request, res: Response) {
    db.prepare("DELETE FROM lessons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  }

  static updateProgress(req: Request, res: Response) {
    const { user_id, lesson_id } = req.body;
    try {
      db.prepare("INSERT INTO progress (user_id, lesson_id) VALUES (?, ?)").run(user_id, lesson_id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already completed or invalid data" });
    }
  }

  static getProgress(req: Request, res: Response) {
    const progress = db.prepare("SELECT lesson_id FROM progress WHERE user_id = ?").all(req.params.id);
    res.json(progress);
  }
}
