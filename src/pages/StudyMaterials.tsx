import React, { useState } from 'react';
import { BookOpen, Search, Bell, Folder, FileText, Video, Download, ArrowRight, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudyMaterials() {
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
                            <Link to="/student/results" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Нәтижелер</Link>
                            <Link to="/student/materials" className="text-sm font-semibold text-[#4848e5]">Оқу материалдары</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                className="h-9 w-64 rounded-lg border-none bg-slate-100 pl-9 text-sm focus:ring-2 focus:ring-[#4848e5]/50 outline-none"
                                placeholder="Материалдарды іздеу..."
                                type="text"
                            />
                        </div>
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
                                    <Link to="/profile/settings" className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        Профиль баптаулары
                                    </Link>
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Оқу материалдары</h1>
                        <p className="mt-2 text-base text-slate-500">Курстар, дәрістер және қосымша ресурстарға қол жеткізіңіз.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Жоғары математика</h3>
                        <p className="text-sm text-slate-500 mb-6">Сызықтық алгебра, математикалық анализ және дифференциалдық теңдеулер.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-[#4848e5]" />
                                    <span className="text-sm font-medium text-slate-700">1-дәріс: Матрицалар</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <Video className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Бейне: Теңдеулер жүйесі</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Органикалық химия</h3>
                        <p className="text-sm text-slate-500 mb-6">Көмірсутектер, құрлымдық изомерия және реакциялар механизмдері.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-[#4848e5]" />
                                    <span className="text-sm font-medium text-slate-700">Конспект: Алкандар</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-[#4848e5]" />
                                    <span className="text-sm font-medium text-slate-700">Зертханалық жұмыс №2</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Дүниежүзі тарихы</h3>
                        <p className="text-sm text-slate-500 mb-6">Ежелгі өркениеттерден бастап қазіргі жаһандану процестеріне дейін.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <Video className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Деректі фильм: Рим</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleComingSoon}>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-[#4848e5]" />
                                    <span className="text-sm font-medium text-slate-700">Оқулық (PDF)</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
