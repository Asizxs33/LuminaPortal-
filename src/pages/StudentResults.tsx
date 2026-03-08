import React, { useState } from 'react';
import { BookOpen, Search, Bell, ArrowRight, CheckCircle2, XCircle, Clock, Trophy, Target, Award, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentResults() {
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

    return (
        <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-[#4848e5] hover:opacity-80 transition-opacity">
                            <BookOpen className="h-8 w-8" />
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">LuminaPortal</h2>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/student" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Басқару панелі</Link>
                            <Link to="/student" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Қолжетімді тесттер</Link>
                            <Link to="/student/results" className="text-sm font-semibold text-[#4848e5]">Нәтижелер</Link>
                            <Link to="/student/materials" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Оқу материалдары</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors" onClick={handleComingSoon}>
                            <Bell className="h-5 w-5" />
                        </button>
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
                                    <button onClick={handleComingSoon} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        Профиль баптаулары
                                    </button>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Академиялық нәтижелер</h1>
                    <p className="mt-2 text-base text-slate-500">Сіздің барлық аяқталған тесттеріңіз бен бағаларыңыз осы жерде сақталады.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase">Орташа ұпай</p>
                            <p className="text-2xl font-bold text-slate-900">88.5%</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase">Аяқталған тесттер</p>
                            <p className="text-2xl font-bold text-slate-900">12</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase">Жалпы рейтинг</p>
                            <p className="text-2xl font-bold text-slate-900">Үздік 15%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">Соңғы нәтижелер</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {/* Result Item */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Қазақ әдебиеті: Абай жолы</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 15 қазан, 2026</span>
                                        <span className="flex items-center gap-1">Ұзақтығы: 42 мин</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 font-medium">Жинаған ұпай</p>
                                    <p className="text-2xl font-black text-emerald-600">92%</p>
                                </div>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                                    Талдау
                                </button>
                            </div>
                        </div>

                        {/* Result Item */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Информатика: Python негіздері</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 12 қазан, 2026</span>
                                        <span className="flex items-center gap-1">Ұзақтығы: 55 мин</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 font-medium">Жинаған ұпай</p>
                                    <p className="text-2xl font-black text-amber-500">78%</p>
                                </div>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                                    Талдау
                                </button>
                            </div>
                        </div>

                        {/* Result Item */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-[#4848e5]/10 text-[#4848e5] flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Математикалық логика</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 05 қазан, 2026</span>
                                        <span className="flex items-center gap-1">Ұзақтығы: 30 мин</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 font-medium">Жинаған ұпай</p>
                                    <p className="text-2xl font-black text-emerald-600">95%</p>
                                </div>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                                    Талдау
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
