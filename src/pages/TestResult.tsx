import React from 'react';
import { Award, ArrowLeft, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { mockTests } from '../data/mockTests';

export default function TestResult() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const test = id ? mockTests[id] : null;
    const state = location.state as { score: number; total: number } | null;

    if (!test || !state) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Нәтиже табылмады</h2>
                    <button onClick={() => navigate('/student')} className="px-6 py-2 bg-[#4848e5] text-white rounded-lg">Басқару панеліне оралу</button>
                </div>
            </div>
        );
    }

    const { score, total } = state;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= test.passScorePercentage;

    return (
        <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col items-center justify-center py-12 px-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className={`h-32 flex items-center justify-center ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {passed ? (
                        <Award className="h-16 w-16 text-white" />
                    ) : (
                        <XCircle className="h-16 w-16 text-white" />
                    )}
                </div>

                <div className="p-10 text-center">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        {passed ? 'Құттықтаймыз!' : 'Өкінішке орай...'}
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Сіз <span className="font-bold text-slate-900">{test.title}</span> тестін аяқтадыңыз.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 min-w-[160px]">
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Сіздің ұпайыңыз</p>
                            <p className={`text-4xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                {score} <span className="text-xl text-slate-400">/ {total}</span>
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 min-w-[160px]">
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Пайыздық көрсеткіш</p>
                            <p className={`text-4xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                {percentage}%
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 min-w-[160px]">
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Өту шегі</p>
                            <p className="text-4xl font-black text-slate-900">
                                {test.passScorePercentage}%
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/student" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            Басқару панелі
                        </Link>
                        {!passed && (
                            <Link to={`/test/${test.id}/start`} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#4848e5] text-white rounded-lg font-semibold hover:bg-[#4848e5]/90 transition-colors">
                                <RotateCcw className="h-5 w-5" />
                                Қайта тапсыру
                            </Link>
                        )}
                        <Link to="/student/results" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:border-slate-300 transition-colors">
                            Барлық нәтижелер
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
