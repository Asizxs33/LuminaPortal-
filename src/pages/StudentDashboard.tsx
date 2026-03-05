import React, { useState } from 'react';
import { BookOpen, Search, Bell, Clock, HelpCircle, Calendar, ArrowRight, Lock, HelpCircle as Quiz, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type TestStatus = 'active' | 'completed' | 'missed' | 'locked';

interface TestItem {
  id: string;
  title: string;
  subject: string;
  duration: string;
  questionsCount: number;
  dueDate: string;
  image: string;
  status: TestStatus;
  score?: number;
  colorClass: string;
}

const TESTS_DATA: TestItem[] = [
  {
    id: 'math',
    title: 'Жоғары математика',
    subject: 'Math',
    duration: '30 мин',
    questionsCount: 20,
    dueDate: '25 қазан',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    colorClass: 'text-[#4848e5]'
  },
  {
    id: 'physics',
    title: 'Жоғары физика: Кванттық механика',
    subject: 'Physics',
    duration: '60 мин',
    questionsCount: 20,
    dueDate: '28 қазан',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    colorClass: 'text-emerald-600'
  },
  {
    id: 'history',
    title: 'Дүниежүзі тарихы',
    subject: 'History',
    duration: '20 мин',
    questionsCount: 15,
    dueDate: '30 қазан',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    colorClass: 'text-amber-600'
  },
  {
    id: 'economics',
    title: 'Макроэкономика',
    subject: 'Economics',
    duration: '40 мин',
    questionsCount: 25,
    dueDate: '02 қараша',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    colorClass: 'text-blue-600'
  },
  {
    id: 'physics',
    title: 'Физика: Салыстырмалылық',
    subject: 'Physics',
    duration: '60 мин',
    questionsCount: 40,
    dueDate: '10 қараша',
    image: '',
    status: 'locked',
    colorClass: 'text-slate-500'
  },
  {
    id: 'literature',
    title: 'Қазақ әдебиеті',
    subject: 'Literature',
    duration: '45 мин',
    questionsCount: 25,
    dueDate: '15 қазан',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    status: 'completed',
    score: 92,
    colorClass: 'text-purple-600'
  },
  {
    id: 'geography',
    title: 'Физикалық география',
    subject: 'Geography',
    duration: '30 мин',
    questionsCount: 20,
    dueDate: '10 қазан',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800',
    status: 'missed',
    colorClass: 'text-red-600'
  }
];

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TestStatus>('active');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Бұл бөлім жақында іске қосылады!');
  };

  const filteredTests = TESTS_DATA.filter((test) => {
    // 1. Check if the active filter matches the test status. 
    // If 'active', we ideally show both 'active' and 'locked'.
    const matchesFilter = activeFilter === 'active'
      ? (test.status === 'active' || test.status === 'locked')
      : test.status === activeFilter;

    // 2. Check if the search query is in the title (case-insensitive)
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalTestsCount = TESTS_DATA.length;
  const pendingTestsCount = TESTS_DATA.filter(t => t.status === 'active').length;
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={() => { setSearchQuery(''); setActiveFilter('active'); }} className="flex items-center gap-2 text-[#4848e5] hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">LuminaPortal</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/student" onClick={() => { setSearchQuery(''); setActiveFilter('active'); }} className="text-sm font-semibold text-[#4848e5]">
                Басқару панелі
              </Link>
              <Link to="/student" onClick={() => { setSearchQuery(''); setActiveFilter('active'); }} className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">
                Қолжетімді тесттер
              </Link>
              <Link to="/student/results" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Нәтижелер</Link>
              <Link to="/student/materials" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Оқу материалдары</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                className="h-9 w-64 rounded-lg border-none bg-slate-100 pl-9 text-sm focus:ring-2 focus:ring-[#4848e5]/50 outline-none"
                placeholder="Бағалауларды іздеу..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors" onClick={handleComingSoon}>
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-full bg-[#4848e5]/10 border border-[#4848e5]/20 overflow-hidden hover:ring-2 hover:ring-[#4848e5]/50 transition-all focus:outline-none"
              >
                <img alt="Profile" className="h-full w-full object-cover" src="https://i.pravatar.cc/150?img=32" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-900">{user?.role === 'admin' ? 'Әкімші' : 'Студент'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.role === 'admin' ? 'admin@example.com' : 'student@example.com'}</p>
                  </div>
                  <Link
                    to="/profile/settings"
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Профиль баптаулары
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Шығу
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Қолжетімді тесттер</h1>
            <p className="mt-2 text-base text-slate-500">Алдағы бағалауларыңызды басқарыңыз және академиялық үлгеріміңізді бақылаңыз.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${activeFilter === 'active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Белсенді
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${activeFilter === 'completed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Аяқталған
            </button>
            <button
              onClick={() => setActiveFilter('missed')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${activeFilter === 'missed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Өткізіп алған
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Барлық тесттер</p>
            <p className="text-2xl font-bold mt-1">{totalTestsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Күтілуде</p>
            <p className="text-2xl font-bold mt-1 text-[#4848e5]">{String(pendingTestsCount).padStart(2, '0')}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Орташа ұпай</p>
            <p className="text-2xl font-bold mt-1">88%</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Жұмсалған уақыт</p>
            <p className="text-2xl font-bold mt-1">14.5 сағ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            if (test.status === 'locked') {
              return (
                <div key={test.id} className="group bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden flex flex-col opacity-75">
                  <div className="h-40 w-full bg-slate-200 flex items-center justify-center relative">
                    <Lock className="h-10 w-10 text-slate-400" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-500 mb-4">{test.title}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-slate-400 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{test.dueDate} ашылады</span>
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>{test.questionsCount} Сұрақ</span>
                      </div>
                    </div>
                    <button className="mt-auto w-full bg-slate-200 text-slate-500 font-semibold py-2.5 rounded-lg cursor-not-allowed" disabled>
                      Бұғатталған
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={test.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#4848e5]/30 transition-all overflow-hidden flex flex-col">
                <div className="h-40 w-full bg-slate-100 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${test.status === 'completed' ? 'from-purple-500/20' : test.status === 'missed' ? 'from-red-500/20' : 'from-[#4848e5]/20'} to-transparent z-10`}></div>
                  <img className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-500" src={test.image} alt={test.subject} />
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2 py-1 bg-white/90 rounded text-[10px] font-bold uppercase ${test.colorClass}`}>{test.subject}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                    {test.status === 'completed' && test.score && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">{test.score}%</span>
                    )}
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Ұзақтығы: {test.duration}</span>
                    </div>
                    <div className="flex items-center text-slate-600 text-sm">
                      <HelpCircle className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{test.questionsCount} Сұрақ</span>
                    </div>
                    <div className={`flex items-center text-sm font-medium ${test.status === 'missed' ? 'text-red-500' : 'text-slate-600'}`}>
                      <Calendar className={`h-4 w-4 mr-2 ${test.status === 'missed' ? '' : 'text-slate-400'}`} />
                      <span>Мерзімі: {test.dueDate}</span>
                    </div>
                  </div>
                  {test.status === 'active' && (
                    <Link to={`/test/${test.id}/start`} className="mt-auto w-full bg-[#4848e5] hover:bg-[#4848e5]/90 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                      Тестті бастау
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {test.status === 'completed' && (
                    <button className="mt-auto w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                      Нәтижені қарау
                    </button>
                  )}
                  {test.status === 'missed' && (
                    <button className="mt-auto w-full bg-red-50 text-red-600 font-semibold py-2.5 rounded-lg cursor-not-allowed" disabled>
                      Мерзімі өтіп кетті
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTests.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Тесттер табылған жоқ</h3>
              <p className="text-slate-500 text-sm">Сіздің іздеуіңізге немесе сүзгіңізге сәйкес келетін тесттер жоқ.</p>
            </div>
          )}

          {/* Practice Mode Card */}
          <div className="group bg-[#4848e5] rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <Quiz className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Тәжірибе режимі</h3>
            <p className="text-sm text-indigo-100/80 mb-6 px-4">Нағыз емтихан алдында дағдыларыңызды шыңдау үшін бағаланбайтын тәжірибелік тесттерден өтіңіз.</p>
            <button className="bg-white text-[#4848e5] px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
              Тәжірибені қарау
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 mt-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">© 2026 LuminaPortal Студенттерді басқару</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="text-sm text-slate-500 hover:text-[#4848e5] transition-colors" href="#">Құпиялылық саясаты</a>
            <a className="text-sm text-slate-500 hover:text-[#4848e5] transition-colors" href="#">Қолдау орталығы</a>
            <a className="text-sm text-slate-500 hover:text-[#4848e5] transition-colors" href="#">Академиялық ережелер</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
