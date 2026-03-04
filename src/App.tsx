/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Shield, 
  Cpu, 
  Bot, 
  Award, 
  Globe, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap,
  LayoutDashboard,
  Search,
  Menu,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { Course, Lesson, User, Certificate } from './types';

// Mock User for demo
const MOCK_USER: User = {
  id: 1,
  name: "Balram",
  email: "balram@balram.com.np",
  grade: 10
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [view, setView] = useState<'dashboard' | 'course' | 'lesson' | 'certificates' | 'admin'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [userCerts, setUserCerts] = useState<Certificate[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'curriculum' | 'special'>('all');
  
  // Admin State
  const [adminTab, setAdminTab] = useState<'overview' | 'courses' | 'users' | 'lessons'>('overview');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Course>>({});
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Partial<Lesson>>({});
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchProgress();
    fetchCertificates();
    if (view === 'admin') fetchAdminData();
  }, [view]);

  const fetchAdminData = async () => {
    const statsRes = await fetch('/api/admin/stats');
    const statsData = await statsRes.json();
    setAdminStats(statsData);

    const usersRes = await fetch('/api/admin/users');
    const usersData = await usersRes.json();
    setAdminUsers(usersData);
  };

  const handleSaveCourse = async () => {
    const method = editCourse.id ? 'PUT' : 'POST';
    const url = editCourse.id ? `/api/admin/courses/${editCourse.id}` : '/api/admin/courses';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editCourse)
    });
    
    setIsEditingCourse(false);
    setEditCourse({});
    fetchCourses();
    fetchAdminData();
  };

  const handleSaveLesson = async () => {
    const method = editLesson.id ? 'PUT' : 'POST';
    const url = editLesson.id ? `/api/admin/lessons/${editLesson.id}` : '/api/admin/lessons';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editLesson)
    });
    
    setIsEditingLesson(false);
    setEditLesson({});
    if (selectedCourse) handleCourseSelect(selectedCourse);
    fetchAdminData();
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
    if (selectedCourse) handleCourseSelect(selectedCourse);
    fetchAdminData();
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    fetchCourses();
    fetchAdminData();
  };

  const fetchCourses = async () => {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourses(data);
  };

  const fetchProgress = async () => {
    const res = await fetch(`/api/user/${MOCK_USER.id}/progress`);
    const data = await res.json();
    setCompletedLessons(data.map((p: any) => p.lesson_id));
  };

  const fetchCertificates = async () => {
    const res = await fetch(`/api/certificates/${MOCK_USER.id}`);
    const data = await res.json();
    setUserCerts(data);
  };

  const handleCourseSelect = async (course: Course) => {
    const res = await fetch(`/api/courses/${course.id}`);
    const data = await res.json();
    setSelectedCourse(data);
    setView('course');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView('lesson');
  };

  const completeLesson = async (lessonId: number) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: MOCK_USER.id, lesson_id: lessonId })
    });
    setCompletedLessons([...completedLessons, lessonId]);
    
    // Check if course completed
    if (selectedCourse && (selectedCourse as any).lessons) {
      const allDone = (selectedCourse as any).lessons.every((l: any) => 
        l.id === lessonId || completedLessons.includes(l.id)
      );
      if (allDone) {
        generateCertificate(selectedCourse.id);
      }
    }
  };

  const generateCertificate = async (courseId: number) => {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: MOCK_USER.id, course_id: courseId })
    });
    if (res.ok) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      fetchCertificates();
    }
  };

  const t = (en: string, ne: string) => lang === 'en' ? en : ne;

  const filteredCourses = courses.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'curriculum') return c.category === 'curriculum';
    if (activeTab === 'special') return c.category !== 'curriculum';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-indigo-900">SIKSHYA</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setView('dashboard')}
                className={cn("text-sm font-medium transition-colors", view === 'dashboard' ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600")}
              >
                {t('Dashboard', 'ड्यासबोर्ड')}
              </button>
              <button 
                onClick={() => setView('certificates')}
                className={cn("text-sm font-medium transition-colors", view === 'certificates' ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600")}
              >
                {t('Certificates', 'प्रमाणपत्रहरू')}
              </button>
              <button 
                onClick={() => setView('admin')}
                className={cn("text-sm font-medium transition-colors", view === 'admin' ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600")}
              >
                {t('Admin', 'प्रशासक')}
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <button 
                onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'en' ? 'नेपाली' : 'English'}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {MOCK_USER.name[0]}
                </div>
                <span className="text-sm font-medium text-gray-700">{MOCK_USER.name}</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-gray-200 px-4 py-6 space-y-4"
          >
            <button onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">{t('Dashboard', 'ड्यासबोर्ड')}</button>
            <button onClick={() => { setView('certificates'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">{t('Certificates', 'प्रमाणपत्रहरू')}</button>
            <button onClick={() => { setLang(lang === 'en' ? 'ne' : 'en'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-indigo-600">
              {lang === 'en' ? 'Switch to Nepali' : 'Switch to English'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-3xl bg-indigo-900 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    {t('Empowering the Next Generation of Nepal', 'नेपालको नयाँ पुस्तालाई सशक्त बनाउँदै')}
                  </h1>
                  <p className="text-indigo-100 text-lg mb-8 opacity-90">
                    {t('Access Grade 1-12 curriculum and cutting-edge courses in AI, Robotics, and Cyber Security.', 'कक्षा १-१२ को पाठ्यक्रम र AI, रोबोटिक्स, र साइबर सुरक्षामा अत्याधुनिक पाठ्यक्रमहरू पहुँच गर्नुहोस्।')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                      {t('Browse Courses', 'पाठ्यक्रमहरू हेर्नुहोस्')}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-800/50 rounded-xl border border-indigo-700/50">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">{userCerts.length} {t('Certificates Earned', 'प्रमाणपत्रहरू प्राप्त')}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                  <Cpu className="w-full h-full" />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {(['all', 'curriculum', 'special'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                      activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab === 'all' ? t('All Courses', 'सबै पाठ्यक्रमहरू') : 
                     tab === 'curriculum' ? t('Grade 1-12', 'कक्षा १-१२') : 
                     t('Specialized', 'विशेषज्ञता')}
                  </button>
                ))}
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -5 }}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title_en} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white",
                          course.category === 'curriculum' ? "bg-emerald-500" : 
                          course.category === 'ai' ? "bg-purple-500" :
                          course.category === 'robotics' ? "bg-orange-500" : "bg-blue-500"
                        )}>
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                        {t(course.title_en, course.title_ne)}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {t(course.description_en, course.description_ne)}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-indigo-600">
                          {course.grade > 0 ? `${t('Grade', 'कक्षा')} ${course.grade}` : t('Special Course', 'विशेष पाठ्यक्रम')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'course' && selectedCourse && (
            <motion.div 
              key="course-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Back to Dashboard', 'ड्यासबोर्डमा फर्कनुहोस्')}
              </button>

              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-8 md:p-12 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                        {selectedCourse.category}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-bold mb-4">{t(selectedCourse.title_en, selectedCourse.title_ne)}</h1>
                      <p className="text-gray-500 text-lg max-w-2xl">
                        {t(selectedCourse.description_en, selectedCourse.description_ne)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                        {selectedCourse.category === 'ai' ? <Cpu className="w-12 h-12" /> : 
                         selectedCourse.category === 'robotics' ? <Bot className="w-12 h-12" /> :
                         selectedCourse.category === 'cybersecurity' ? <Shield className="w-12 h-12" /> :
                         <BookOpen className="w-12 h-12" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{t('Course Content', 'पाठ्यक्रम सामग्री')}</h2>
                    {view === 'admin' && (
                      <button 
                        onClick={() => { setEditLesson({ course_id: selectedCourse.id, order_index: (selectedCourse as any).lessons?.length + 1 }); setIsEditingLesson(true); }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        + Add Lesson
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {(selectedCourse as any).lessons?.map((lesson: Lesson, idx: number) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-1" onClick={() => handleLessonSelect(lesson)}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                            completedLessons.includes(lesson.id) ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                          )}>
                            {completedLessons.includes(lesson.id) ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold group-hover:text-indigo-600 transition-colors">{t(lesson.title_en, lesson.title_ne)}</h4>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">
                              {completedLessons.includes(lesson.id) ? t('Completed', 'पूरा भयो') : t('Lesson', 'पाठ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {view === 'admin' && (
                            <div className="flex gap-2">
                              <button onClick={() => { setEditLesson(lesson); setIsEditingLesson(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Edit</button>
                              <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isEditingLesson && (
                  <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold">{editLesson.id ? 'Edit Lesson' : 'New Lesson'}</h3>
                        <button onClick={() => setIsEditingLesson(false)}><X /></button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-400">Title (EN)</label>
                          <input 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editLesson.title_en || ''}
                            onChange={e => setEditLesson({...editLesson, title_en: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-400">Title (NE)</label>
                          <input 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editLesson.title_ne || ''}
                            onChange={e => setEditLesson({...editLesson, title_ne: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-400">Content (EN) - Markdown</label>
                          <textarea 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-48 font-mono text-sm"
                            value={editLesson.content_en || ''}
                            onChange={e => setEditLesson({...editLesson, content_en: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-400">Content (NE) - Markdown</label>
                          <textarea 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-48 font-mono text-sm"
                            value={editLesson.content_ne || ''}
                            onChange={e => setEditLesson({...editLesson, content_ne: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                        <button 
                          onClick={handleSaveLesson}
                          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                        >
                          Save Lesson
                        </button>
                        <button 
                          onClick={() => setIsEditingLesson(false)}
                          className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'lesson' && selectedLesson && (
            <motion.div 
              key="lesson-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setView('course')}
                  className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('Back to Course', 'पाठ्यक्रममा फर्कनुहोस्')}
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                  >
                    {lang === 'en' ? 'नेपालीमा पढ्नुहोस्' : 'Read in English'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 border-b border-gray-100 bg-indigo-50/30">
                  <h1 className="text-3xl font-bold mb-2">{t(selectedLesson.title_en, selectedLesson.title_ne)}</h1>
                  <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    {t('Lesson Content', 'पाठको सामग्री')}
                  </p>
                </div>
                <div className="p-8 md:p-12 prose prose-indigo max-w-none">
                  <div className="markdown-body">
                    <Markdown>{t(selectedLesson.content_en, selectedLesson.content_ne)}</Markdown>
                  </div>
                </div>
                <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100 flex justify-center">
                  {!completedLessons.includes(selectedLesson.id) ? (
                    <button 
                      onClick={() => completeLesson(selectedLesson.id)}
                      className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      {t('Mark as Completed', 'पूरा भएको रूपमा चिन्ह लगाउनुहोस्')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-10 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold border border-emerald-200">
                      <CheckCircle2 className="w-6 h-6" />
                      {t('Lesson Completed!', 'पाठ पूरा भयो!')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div 
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('Admin Control Panel', 'प्रशासक नियन्त्रण प्यानल')}</h1>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  {(['overview', 'courses', 'users'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAdminTab(tab)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        adminTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
                      )}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {adminTab === 'overview' && adminStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Courses', value: adminStats.courses, icon: BookOpen, color: 'text-blue-600' },
                    { label: 'Total Lessons', value: adminStats.lessons, icon: LayoutDashboard, color: 'text-purple-600' },
                    { label: 'Total Students', value: adminStats.users, icon: GraduationCap, color: 'text-emerald-600' },
                    { label: 'Certificates Issued', value: adminStats.certificates, icon: Award, color: 'text-orange-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <stat.icon className={cn("w-8 h-8 mb-4", stat.color)} />
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'courses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('Manage Courses', 'पाठ्यक्रमहरू व्यवस्थापन गर्नुहोस्')}</h2>
                    <button 
                      onClick={() => { setEditCourse({ category: 'curriculum', grade: 1 }); setIsEditingCourse(true); }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      + {t('Add New Course', 'नयाँ पाठ्यक्रम थप्नुहोस्')}
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold">{course.title_en}</div>
                              <div className="text-xs text-gray-400">{course.title_ne}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold uppercase">{course.category}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{course.grade || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button onClick={() => { setEditCourse(course); setIsEditingCourse(true); }} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase">Edit</button>
                                <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'users' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">{t('Registered Students', 'दर्ता भएका विद्यार्थीहरू')}</h2>
                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold">{user.name}</td>
                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 font-medium">{user.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {isEditingCourse && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold">{editCourse.id ? 'Edit Course' : 'New Course'}</h3>
                      <button onClick={() => setIsEditingCourse(false)}><X /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Title (EN)</label>
                        <input 
                          className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editCourse.title_en || ''}
                          onChange={e => setEditCourse({...editCourse, title_en: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Title (NE)</label>
                        <input 
                          className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editCourse.title_ne || ''}
                          onChange={e => setEditCourse({...editCourse, title_ne: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Description (EN)</label>
                        <textarea 
                          className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                          value={editCourse.description_en || ''}
                          onChange={e => setEditCourse({...editCourse, description_en: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Category</label>
                        <select 
                          className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                          value={editCourse.category}
                          onChange={e => setEditCourse({...editCourse, category: e.target.value as any})}
                        >
                          <option value="curriculum">Curriculum</option>
                          <option value="ai">AI</option>
                          <option value="robotics">Robotics</option>
                          <option value="cybersecurity">Cyber Security</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Grade</label>
                        <input 
                          type="number"
                          className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                          value={editCourse.grade || 0}
                          onChange={e => setEditCourse({...editCourse, grade: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button 
                        onClick={handleSaveCourse}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                      >
                        Save Course
                      </button>
                      <button 
                        onClick={() => setIsEditingCourse(false)}
                        className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'certificates' && (
            <motion.div 
              key="certs-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold mb-4">{t('Your Achievements', 'तपाईंका उपलब्धिहरू')}</h1>
                <p className="text-gray-500 text-lg">
                  {t('Celebrate your learning journey. Here are the certificates you have earned so far.', 'आफ्नो सिकाई यात्राको उत्सव मनाउनुहोस्। तपाईंले अहिलेसम्म प्राप्त गर्नुभएका प्रमाणपत्रहरू यहाँ छन्।')}
                </p>
              </div>

              {userCerts.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">{t('No certificates yet', 'अहिलेसम्म कुनै प्रमाणपत्र छैन')}</h3>
                  <p className="text-gray-400">{t('Complete all lessons in a course to earn a certificate.', 'प्रमाणपत्र प्राप्त गर्न पाठ्यक्रमका सबै पाठहरू पूरा गर्नुहोस्।')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {userCerts.map((cert) => (
                    <div key={cert.id} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white rounded-3xl border border-gray-200 p-8 shadow-sm overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                          <Award className="w-12 h-12 text-indigo-100" />
                        </div>
                        <div className="flex flex-col items-center text-center space-y-6">
                          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <GraduationCap className="w-8 h-8" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                              {t('CERTIFICATE OF COMPLETION', 'पूरा भएको प्रमाणपत्र')}
                            </h2>
                            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-6">
                              {t('This is to certify that', 'यो प्रमाणित गरिन्छ कि')}
                            </p>
                            <h3 className="text-3xl font-serif italic font-bold text-gray-900 mb-6 border-b-2 border-indigo-100 pb-2 inline-block px-12">
                              {MOCK_USER.name}
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                              {t('has successfully completed the course', 'ले सफलतापूर्वक पाठ्यक्रम पूरा गर्नुभएको छ')}
                            </p>
                            <h4 className="text-xl font-bold text-indigo-600 mt-2">
                              {t(cert.title_en, cert.title_ne)}
                            </h4>
                          </div>
                          <div className="w-full pt-8 border-t border-gray-100 flex justify-between items-end">
                            <div className="text-left">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('Issued On', 'जारी गरिएको मिति')}</p>
                              <p className="text-sm font-bold">{new Date(cert.issued_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('Verify Code', 'प्रमाणिकरण कोड')}</p>
                              <p className="text-sm font-mono font-bold text-indigo-600">{cert.certificate_code}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-indigo-900 uppercase">Sikshya</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                {t('Sikshya is a modern learning platform dedicated to providing quality education based on the Nepali curriculum, enhanced with future-ready skills in technology.', 'शिक्षा एक आधुनिक सिकाई प्लेटफर्म हो जुन नेपाली पाठ्यक्रममा आधारित गुणस्तरीय शिक्षा प्रदान गर्न समर्पित छ, प्रविधिमा भविष्यका लागि तयार सीपहरूका साथ।')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t('Quick Links', 'द्रुत लिङ्कहरू')}</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><button onClick={() => setView('dashboard')} className="hover:text-indigo-600 transition-colors">{t('Dashboard', 'ड्यासबोर्ड')}</button></li>
                <li><button onClick={() => setView('certificates')} className="hover:text-indigo-600 transition-colors">{t('Certificates', 'प्रमाणपत्रहरू')}</button></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('About Us', 'हाम्रो बारेमा')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t('Support', 'सहयोग')}</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('Help Center', 'सहायता केन्द्र')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('Privacy Policy', 'गोपनीयता नीति')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('Contact', 'सम्पर्क')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs">
              © 2024 Sikshya Learning Portal. {t('All rights reserved.', 'सबै अधिकार सुरक्षित।')}
            </p>
            <div className="flex gap-6">
              <Globe className="w-5 h-5 text-gray-300 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Shield className="w-5 h-5 text-gray-300 hover:text-indigo-600 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
