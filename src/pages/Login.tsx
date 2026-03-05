import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, ShieldCheck, Users } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get the path the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || (activeTab === 'student' ? '/student' : '/admin');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (!result.success) {
            setError(result.error || 'Кіру сәтсіз болды');
            return;
        }
        const to = location.state?.from?.pathname || (activeTab === 'student' ? '/student' : '/admin');
        navigate(to, { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-[#4848e5] mb-6">
                    <BookOpen className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Жүйеге кіру
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    LuminaPortal платформасына қош келдіңіз
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">

                    {/* Role Tabs */}
                    <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
                        <button
                            onClick={() => { setActiveTab('student'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'student'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Студент
                        </button>
                        <button
                            onClick={() => { setActiveTab('admin'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'admin'
                                ? 'bg-white text-[#4848e5] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Әкімші
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm font-medium">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Электрондық пошта
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Құпиясөз
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#4848e5] focus:ring-[#4848e5] border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium">
                                    Мені есте сақтау
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-[#4848e5] hover:text-[#4848e5]/80">
                                    Құпиясөзді ұмыттыңыз ба?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-[#4848e5]/20 text-sm font-bold text-white bg-[#4848e5] hover:bg-[#4848e5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4848e5] transition-all disabled:opacity-60"
                            >
                                {loading ? 'Кіру...' : 'Кіру'}
                            </button>
                        </div>

                        <div className="mt-4 text-center space-y-2">
                            {activeTab === 'student' && (
                                <p className="text-sm text-slate-600">
                                    Аккаунтыңыз жоқ па?{' '}
                                    <Link to="/register" className="font-bold text-[#4848e5] hover:text-[#4848e5]/80">
                                        Тіркелу
                                    </Link>
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
