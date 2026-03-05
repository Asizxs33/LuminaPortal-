import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, MoreVertical, Mail,
    ChevronDown, CheckCircle2, Clock, XCircle,
    BarChart3, FileText, Settings, Bell, ArrowUpDown, ShieldCheck, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Student {
    id: number;
    name: string;
    email: string;
    group_name: string;
    role: 'student' | 'admin';
    tests_completed: number;
    avg_score: number;
    status: 'active' | 'inactive' | 'blocked';
}

const STATUS_MAP = {
    active: { label: 'Белсенді', className: 'bg-emerald-50 text-emerald-700' },
    inactive: { label: 'Белсенсіз', className: 'bg-slate-100 text-slate-600' },
    blocked: { label: 'Бұғатталған', className: 'bg-red-50 text-red-600' },
};

export default function AdminStudents() {
    const [search, setSearch] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState<keyof Student>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        fetch('/api/students')
            .then(r => r.json())
            .then(data => { setStudents(data); setLoading(false); })
            .catch(() => { setFetchError('Деректерді жүктеу сәтсіз болды'); setLoading(false); });
    }, []);

    const groups = ['all', ...Array.from(new Set(students.map(s => s.group_name).filter(Boolean)))];

    const handleSort = (field: keyof Student) => {
        if (sortField === field) setSortAsc(a => !a);
        else { setSortField(field); setSortAsc(true); }
    };

    const filtered = students
        .filter(s => {
            const q = search.toLowerCase();
            return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
                (filterGroup === 'all' || s.group_name === filterGroup) &&
                (filterStatus === 'all' || s.status === filterStatus);
        })
        .sort((a, b) => {
            const av = a[sortField]; const bv = b[sortField];
            if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
            return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });

    const toggleStatus = (id: number, status: Student['status']) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        setOpenMenuId(null);
    };

    const changeRole = async (id: number, role: 'student' | 'admin') => {
        setOpenMenuId(null);
        try {
            const res = await fetch(`/api/students/${id}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            if (res.ok) {
                setStudents(prev => prev.map(s => s.id === id ? { ...s, role } : s));
            }
        } catch {
            alert('Роль өзгерту сәтсіз болды');
        }
    };

    const SortBtn = ({ field, label }: { field: keyof Student; label: string }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-[#4848e5] transition-colors"
        >
            {label}
            <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-[#4848e5]' : 'text-slate-300'}`} />
        </button>
    );

    const activeCount = students.length;
    const avgAll = students.filter(s => s.avg_score > 0).length
        ? Math.round(students.filter(s => s.avg_score > 0).reduce((a, s) => a + s.avg_score, 0) / students.filter(s => s.avg_score > 0).length)
        : 0;
    const totalTests = students.reduce((a, s) => a + s.tests_completed, 0);

    return (
        <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
            {loading && (
                <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
                    <div className="text-[#4848e5] font-semibold animate-pulse">Жүктелуде...</div>
                </div>
            )}
            {fetchError && (
                <div className="bg-red-50 text-red-600 p-4 text-center text-sm font-semibold">{fetchError}</div>
            )}
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-[#4848e5] hover:opacity-80 transition-opacity">
                        <Users className="h-6 w-6" />
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">LuminaAdmin</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Басқару панелі</Link>
                        <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Тесттер</Link>
                        <Link to="/admin/results" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Аналитика</Link>
                        <span className="text-sm font-semibold text-[#4848e5] border-b-2 border-[#4848e5] py-5">Студенттер</span>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>
                    <Link to="/profile/settings" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings className="h-5 w-5" />
                    </Link>
                    <Link to="/profile/settings" className="h-8 w-8 rounded-full bg-[#4848e5]/10 border border-[#4848e5]/20 overflow-hidden hover:ring-2 hover:ring-[#4848e5]/50 transition-all">
                        <img alt="Profile" className="h-full w-full object-cover" src="https://i.pravatar.cc/150?img=32" />
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Студенттер тізімі</h1>
                    <p className="text-slate-500 mt-1">Жүйеге тіркелген барлық студенттерді басқарыңыз.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
                            <p className="text-sm text-slate-500">Белсенді студент</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{totalTests}</p>
                            <p className="text-sm text-slate-500">Аяқталған тесттер</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{avgAll}%</p>
                            <p className="text-sm text-slate-500">Орташа баллы</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-4 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Аты немесе email арқылы іздеу..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5]"
                        />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <select
                                value={filterGroup}
                                onChange={e => setFilterGroup(e.target.value)}
                                className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5]"
                            >
                                <option value="all">Барлық топтар</option>
                                {groups.filter(g => g !== 'all').map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5]"
                        >
                            <option value="all">Барлық мәртебе</option>
                            <option value="active">Белсенді</option>
                            <option value="inactive">Белсенсіз</option>
                            <option value="blocked">Бұғатталған</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <SortBtn field="name" label="Аты-жөні" />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <SortBtn field="group_name" label="Топ" />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <SortBtn field="tests_completed" label="Тесттер" />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <SortBtn field="avg_score" label="Орт. балл" />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <SortBtn field="status" label="Белсенділігі" />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Мәртебе</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Рөл</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center text-slate-400">
                                            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p>Студент табылмады</p>
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#4848e5] to-[#7070ff] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{s.name}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />{s.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{s.group_name || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{s.tests_completed}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${s.avg_score >= 75 ? 'bg-emerald-500' : s.avg_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${s.avg_score}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-slate-800">{s.avg_score > 0 ? `${s.avg_score}%` : '–'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {s.status === 'active' ? 'Белсенді' : '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_MAP[s.status]?.className ?? 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_MAP[s.status]?.label ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#4848e5]/10 text-[#4848e5]">
                                                    <ShieldCheck className="h-3 w-3" />Әкімші
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                                    <GraduationCap className="h-3 w-3" />Студент
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                            {openMenuId === s.id && (
                                                <div className="absolute right-6 top-12 z-20 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2">
                                                    <p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Мәртебе</p>
                                                    <button onClick={() => toggleStatus(s.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Белсендіру</button>
                                                    <button onClick={() => toggleStatus(s.id, 'inactive')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Clock className="h-4 w-4" />Белсенсіз ету</button>
                                                    <button onClick={() => toggleStatus(s.id, 'blocked')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><XCircle className="h-4 w-4" />Бұғаттау</button>
                                                    <div className="border-t border-slate-100 my-2" />
                                                    <p className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Рөл</p>
                                                    {s.role === 'student' ? (
                                                        <button onClick={() => changeRole(s.id, 'admin')} className="w-full text-left px-4 py-2 text-sm text-[#4848e5] hover:bg-[#4848e5]/10 flex items-center gap-2">
                                                            <ShieldCheck className="h-4 w-4" />Әкімші ету
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => changeRole(s.id, 'student')} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                            <GraduationCap className="h-4 w-4" />Студент ету
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400 flex justify-between items-center">
                        <span>{filtered.length} студент (барлығы {students.length})</span>
                        <span>Сорттау: {sortField} {sortAsc ? '↑' : '↓'}</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
