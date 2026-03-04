export interface Course {
  id: number;
  title_en: string;
  title_ne: string;
  description_en: string;
  description_ne: string;
  grade: number;
  category: 'curriculum' | 'ai' | 'robotics' | 'cybersecurity';
  thumbnail: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title_en: string;
  title_ne: string;
  content_en: string;
  content_ne: string;
  order_index: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  grade: number;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  issued_at: string;
  certificate_code: string;
  title_en: string;
  title_ne: string;
}
