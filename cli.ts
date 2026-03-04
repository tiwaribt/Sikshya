import db from "./src/server/database/db.ts";
import { initSchema } from "./src/server/database/schema.ts";
import { seed } from "./src/server/database/seed.ts";

const command = process.argv[2];

async function run() {
  switch (command) {
    case "db:init":
      console.log("Initializing database...");
      initSchema();
      console.log("Done.");
      break;
    case "db:seed":
      console.log("Seeding database...");
      seed();
      console.log("Done.");
      break;
    case "db:reset":
      console.log("Resetting database...");
      db.exec("DROP TABLE IF EXISTS progress;");
      db.exec("DROP TABLE IF EXISTS certificates;");
      db.exec("DROP TABLE IF EXISTS lessons;");
      db.exec("DROP TABLE IF EXISTS courses;");
      db.exec("DROP TABLE IF EXISTS users;");
      initSchema();
      seed();
      console.log("Done.");
      break;
    case "user:create":
      const name = process.argv[3];
      const email = process.argv[4];
      const grade = process.argv[5];
      if (!name || !email) {
        console.log("Usage: user:create <name> <email> [grade]");
        return;
      }
      db.prepare("INSERT INTO users (name, email, grade) VALUES (?, ?, ?)").run(name, email, grade || 10);
      console.log(`User ${name} created.`);
      break;
    default:
      console.log("Available commands:");
      console.log("  db:init   - Initialize the database schema");
      console.log("  db:seed   - Seed the database with initial data");
      console.log("  db:reset  - Reset and re-seed the database");
      console.log("  user:create <name> <email> [grade] - Create a new user");
  }
}

run();
