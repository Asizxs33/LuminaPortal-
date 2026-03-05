import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, CheckCircle, User, Mail, Lock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GROUPS = ['CS-201', 'CS-202', 'PH-102', 'PH-103', 'MT-301', 'MT-305', 'HI-110', 'HI-111'];

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirm: '',
        group_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Құпиясөздер сәйкес келмейді');
            return;
        }
        if (form.password.length < 6) {
            setError('Құпиясөз кемінде 6 символдан тұруы керек');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: 'student',
                    group_name: form.group_name || null,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error === 'Email already exists'
                    ? 'Бұл email бұрыннан тіркелген'
                    : data.error || 'Тіркелу сәтсіз болды');
                setLoading(false);
                return;
            }

            // Auto-login after registration
            setSuccess(true);
            setTimeout(async () => {
                await login(form.email, form.password);
                navigate('/student', { replace: true });
            }, 1200);
        } catch {
            setError('Желі қатесі. Сервер іске қосылған ба?');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center text-[#4848e5] mb-6 hover:opacity-80 transition-opacity">
                    <BookOpen className="h-12 w-12" />
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-slate-900">
                    Тіркелу
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    LuminaPortal студент порталына қош келдіңіз
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">

                    {success ? (
                        <div className="flex flex-col items-center py-8 gap-4">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-bold text-slate-900">Тіркелу сәтті!</p>
                            <p className="text-sm text-slate-500 animate-pulse">Жүйеге кіру...</p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm font-medium">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Аты-жөні
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={set('name')}
                                        placeholder="Мысалы: Айгерім Бекова"
                                        className="pl-10 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Электрондық пошта
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={set('email')}
                                        placeholder="name@lumina.edu"
                                        className="pl-10 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Group */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Топ <span className="font-normal text-slate-400">(міндетті емес)</span>
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select
                                        value={form.group_name}
                                        onChange={set('group_name')}
                                        className="pl-10 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm bg-white"
                                    >
                                        <option value="">Топты таңдаңыз</option>
                                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Құпиясөз
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={form.password}
                                        onChange={set('password')}
                                        placeholder="Кемінде 6 таңба"
                                        className="pl-10 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Құпиясөзді растаңыз
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={form.confirm}
                                        onChange={set('confirm')}
                                        placeholder="Құпиясөзді қайта енгізіңіз"
                                        className={`pl-10 appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4848e5] focus:border-transparent transition-all sm:text-sm ${form.confirm && form.confirm !== form.password
                                                ? 'border-red-300 bg-red-50'
                                                : form.confirm && form.confirm === form.password
                                                    ? 'border-emerald-300 bg-emerald-50'
                                                    : 'border-slate-200'
                                            }`}
                                    />
                                </div>
                                {form.confirm && form.confirm === form.password && (
                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" /> Құпиясөздер сәйкес
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-[#4848e5]/20 text-sm font-bold text-white bg-[#4848e5] hover:bg-[#4848e5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4848e5] transition-all disabled:opacity-60"
                            >
                                {loading ? 'Тіркелуде...' : 'Тіркелу'}
                            </button>

                            <p className="text-center text-sm text-slate-600 pt-2">
                                Аккаунтыңыз бар ма?{' '}
                                <Link to="/login" className="font-bold text-[#4848e5] hover:text-[#4848e5]/80">
                                    Жүйеге кіру
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
