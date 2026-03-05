import React from 'react';
import {
  BarChart3, Users, Clock, CheckCircle2, Search, Filter,
  Download, ChevronDown, ArrowUpRight, ArrowDownRight, LayoutDashboard, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const scoreData = [
  { range: '0-20', count: 5 },
  { range: '21-40', count: 12 },
  { range: '41-60', count: 35 },
  { range: '61-80', count: 85 },
  { range: '81-100', count: 42 },
];

const trendData = [
  { day: 'Mon', avg: 65 },
  { day: 'Tue', avg: 68 },
  { day: 'Wed', avg: 74 },
  { day: 'Thu', avg: 72 },
  { day: 'Fri', avg: 81 },
  { day: 'Sat', avg: 85 },
  { day: 'Sun', avg: 82 },
];

export default function ResultsDashboard() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
      {/* Top Nav */}
      <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-[#4848e5] hover:opacity-80 transition-opacity">
            <BarChart3 className="h-6 w-6" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">LuminaAdmin</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Басқару панелі</Link>
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Тесттер</Link>
            <Link to="/admin/results" className="text-sm font-semibold text-[#4848e5] border-b-2 border-[#4848e5] py-5">Аналитика</Link>
            <Link to="/admin/students" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Студенттер</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/student" className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold">
            <Users className="h-4 w-4" />
            Студент порталына өту
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Есепті жүктеу
          </button>
          <Link to="/profile/settings" className="h-8 w-8 rounded-full bg-[#4848e5]/10 border border-[#4848e5]/20 overflow-hidden hover:ring-2 hover:ring-[#4848e5]/50 transition-all focus:outline-none">
            <img alt="Profile" className="h-full w-full object-cover" src="https://i.pravatar.cc/150?img=11" />
          </Link>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Аналитикаға шолу</h1>
            <p className="mt-2 text-base text-slate-500">Барлық белсенді бағалаулардағы өнімділік көрсеткіштерін бақылаңыз.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#4848e5]/50 cursor-pointer shadow-sm">
                <option>Барлық бағалаулар</option>
                <option>Инженерия сертификаты 2026</option>
                <option>Физика аралық емтиханы</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#4848e5]/50 cursor-pointer shadow-sm">
                <option>Соңғы 30 күн</option>
                <option>Соңғы 7 күн</option>
                <option>Осы жыл</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12.5%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Барлық қатысушылар</p>
            <h3 className="text-3xl font-black text-slate-900">1,248</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                4.2%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Орташа ұпай</p>
            <h3 className="text-3xl font-black text-slate-900">76.4%</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                1.1%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Аяқтау көрсеткіші</p>
            <h3 className="text-3xl font-black text-slate-900">92.8%</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <span className="flex items-center text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                0.0%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Жұмсалған орташа уақыт</p>
            <h3 className="text-3xl font-black text-slate-900">24м 15с</h3>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Ұпайларды үлестіру</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4848e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Өнімділік тренді</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Соңғы тапсырулар</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 text-sm focus:ring-2 focus:ring-[#4848e5]/50 outline-none" placeholder="Студенттерді іздеу..." type="text" />
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Студент</th>
                  <th className="px-6 py-4">Бағалау</th>
                  <th className="px-6 py-4">Ұпай</th>
                  <th className="px-6 py-4">Уақыт</th>
                  <th className="px-6 py-4">Күні</th>
                  <th className="px-6 py-4 text-right">Әрекет</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">JD</div>
                      <div>
                        <p className="font-bold text-slate-900">John Doe</p>
                        <p className="text-xs text-slate-500">john.d@university.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">Инженерия сертификаты 2026</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      92%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">28м 14с</td>
                  <td className="px-6 py-4 text-slate-600">24 қазан, 14:30</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#4848e5] hover:text-[#4848e5]/80 font-semibold text-sm">Толық көру</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">AS</div>
                      <div>
                        <p className="font-bold text-slate-900">Alice Smith</p>
                        <p className="text-xs text-slate-500">alice.s@university.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">Физика аралық емтиханы</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      68%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">42м 05с</td>
                  <td className="px-6 py-4 text-slate-600">24 қазан, 11:15</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#4848e5] hover:text-[#4848e5]/80 font-semibold text-sm">Толық көру</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">RJ</div>
                      <div>
                        <p className="font-bold text-slate-900">Robert Johnson</p>
                        <p className="text-xs text-slate-500">robert.j@university.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">Инженерия сертификаты 2026</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      45%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">15м 30с</td>
                  <td className="px-6 py-4 text-slate-600">23 қазан, 09:45</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#4848e5] hover:text-[#4848e5]/80 font-semibold text-sm">Толық көру</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Барлық тапсыруларды көру</button>
          </div>
        </div>
      </main>
    </div>
  );
}
