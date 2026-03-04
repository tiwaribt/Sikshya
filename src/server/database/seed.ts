import db from "./db.ts";

export function seed() {
  const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
  if (courseCount.count > 0) return;

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
