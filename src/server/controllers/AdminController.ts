import { Request, Response } from "express";
import db from "../database/db.ts";

export class AdminController {
  static stats(req: Request, res: Response) {
    const stats = {
      courses: (db.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count,
      lessons: (db.prepare("SELECT COUNT(*) as count FROM lessons").get() as any).count,
      users: (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count,
      certificates: (db.prepare("SELECT COUNT(*) as count FROM certificates").get() as any).count,
    };
    res.json(stats);
  }

  static users(req: Request, res: Response) {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  }
}
