import { Request, Response } from "express";
import db from "../database/db.ts";

export class CourseController {
  static index(req: Request, res: Response) {
    const grade = req.query.grade;
    const category = req.query.category;
    let query = "SELECT * FROM courses";
    const params: any[] = [];

    if (grade) {
      query += " WHERE grade = ?";
      params.push(grade);
    } else if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    const courses = db.prepare(query).all(...params);
    res.json(courses);
  }

  static show(req: Request, res: Response) {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
    const lessons = db.prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index").all(req.params.id);
    res.json({ ...course, lessons });
  }

  static store(req: Request, res: Response) {
    const { title_en, title_ne, description_en, description_ne, grade, category, thumbnail } = req.body;
    const result = db.prepare(`
      INSERT INTO courses (title_en, title_ne, description_en, description_ne, grade, category, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title_en, title_ne, description_en, description_ne, grade, category, thumbnail);
    res.json({ id: result.lastInsertRowid });
  }

  static update(req: Request, res: Response) {
    const { title_en, title_ne, description_en, description_ne, grade, category, thumbnail } = req.body;
    db.prepare(`
      UPDATE courses SET title_en = ?, title_ne = ?, description_en = ?, description_ne = ?, grade = ?, category = ?, thumbnail = ?
      WHERE id = ?
    `).run(title_en, title_ne, description_en, description_ne, grade, category, thumbnail, req.params.id);
    res.json({ success: true });
  }

  static destroy(req: Request, res: Response) {
    db.prepare("DELETE FROM lessons WHERE course_id = ?").run(req.params.id);
    db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  }
}
