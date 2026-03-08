import React, { useState } from 'react';
import { User, Mail, Shield, Bell, CheckCircle2, Lock, Smartphone, Globe, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaved, setIsSaved] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.role === 'admin' ? 'admin@lumina.edu' : 'student@lumina.edu',
        phone: '+7 (701) 123-4567',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">Баптаулар</h1>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${activeTab === 'personal' ? 'bg-[#4848e5] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <User className="h-5 w-5" />
                        Жеке ақпарат
                    </button>

                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${activeTab === 'security' ? 'bg-[#4848e5] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Shield className="h-5 w-5" />
                        Қауіпсіздік
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-[#4848e5] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Bell className="h-5 w-5" />
                        Хабарландырулар
                    </button>

                    <div className="h-px bg-slate-200 w-full my-4"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Жүйеден шығу
                    </button>
                </aside>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                    {activeTab === 'personal' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Жеке ақпарат</h2>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-slate-100">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#4848e5] to-[#7070ff] flex items-center justify-center text-white text-4xl shadow-lg border-4 border-white">
                                        {user?.name.charAt(0) || 'U'}
                                    </div>
                                    <button className="absolute bottom-0 right-0 h-10 w-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#4848e5] transition-colors">
                                        <User className="h-5 w-5" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{formData.name}</h3>
                                    <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                        {user?.role === 'admin' ? 'Әкімші' : 'Студент'}
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-md">Форматты қолдайтын суреттер (JPG, PNG). Максималды көлемі 5MB.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Толық аты-жөні</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Электрондық пошта</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Телефон нөмірі</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Smartphone className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Тіл</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <select className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all appearance-none cursor-pointer">
                                                <option>Қазақша</option>
                                                <option>Русский</option>
                                                <option>English</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-100">
                                    {isSaved && (
                                        <span className="flex items-center gap-2 text-emerald-600 font-semibold animate-pulse">
                                            <CheckCircle2 className="h-5 w-5" /> Сақталды
                                        </span>
                                    )}
                                    <button type="submit" className="px-8 py-3 bg-[#4848e5] text-white rounded-xl font-bold hover:bg-[#4848e5]/90 transition-colors">
                                        Сақтау
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Қауіпсіздік және Құпия сөз</h2>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-8">
                                <h4 className="font-bold text-amber-800 mb-1">Екі факторлы аутентификация</h4>
                                <p className="text-sm text-amber-700 mb-4">Есептік жазбаңызды бейтаныс кірулерден қорғау үшін қосымша қауіпсіздік деңгейін қосыңыз.</p>
                                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors">
                                    Жақында қосылады
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Ағымдағы құпия сөз</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Жаңа құпия сөз</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Құпия сөзді растаңыз</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                        Құпия сөзді жаңарту
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Хабарландырулар</h2>

                            <div className="space-y-6">
                                {[
                                    { title: "Жаңа тесттер", desc: "Маған тағайындалған жаңа тесттер туралы хабарландыру", default: true },
                                    { title: "Тест нәтижелері", desc: "Тесттерді сәтті аяқтаған соң қорытындыны алу", default: true },
                                    { title: "Жүйелік жаңартулар", desc: "Lumina порталындағы жаңа мүмкіндіктер мен өзгерістер бойынша", default: false }
                                ].map((item, idx) => (
                                    <label key={idx} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                        <div className="flex-1 mt-1">
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                        <div className="relative w-12 h-6 cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={item.default} />
                                            <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4848e5]"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
