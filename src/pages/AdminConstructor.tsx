import React, { useState } from 'react';
import {
  FileText, CheckCircle, Archive, Database, Sparkles,
  Upload, Copy, Trash2, Plus, GripVertical, Settings, Bell, LayoutDashboard,
  Circle, CheckSquare, AlignLeft, Users, X, ChevronDown, Save, Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type QuestionType = 'single' | 'multiple' | 'text';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: Option[];
}

const TYPE_LABELS: Record<QuestionType, { label: string; color: string }> = {
  single: { label: 'Бір таңдау', color: 'bg-blue-50 text-blue-600' },
  multiple: { label: 'Бірнеше таңдау', color: 'bg-purple-50 text-purple-600' },
  text: { label: 'Еркін мәтін', color: 'bg-emerald-50 text-emerald-600' },
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1, type: 'single',
    text: 'Термодинамикалық тепе-теңдіктің негізгі принциптерін анықтаңыз?',
    options: [
      { id: 1, text: 'Жүйе барлық күйлерде статикалық болып қалады', isCorrect: true },
      { id: 2, text: 'Энергия үнемі қосылып тұрады', isCorrect: false },
      { id: 3, text: 'Қысым атмосфералық деңгейден асады', isCorrect: false },
    ],
  },
  {
    id: 2, type: 'multiple',
    text: 'Стандартты ФЭ (PV) жүйесі үшін мына компоненттердің қайсысы қажет?',
    options: [
      { id: 1, text: 'Инвертор блогы', isCorrect: true },
      { id: 2, text: 'Күн панельдері', isCorrect: true },
      { id: 3, text: 'Газ турбинасы', isCorrect: false },
    ],
  },
  {
    id: 3, type: 'text',
    text: 'Биіктік аэронавтикасындағы материалдық шаршаудың әсерін түсіндіріңіз.',
    options: [],
  },
];

let nextId = 4;
let nextOptId = 10;

export default function AdminConstructor() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'editor' | 'published' | 'archived' | 'bank' | 'ai'>('editor');
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [testTitle, setTestTitle] = useState('Инженерия сертификаты 2026');
  const [editingTitle, setEditingTitle] = useState(false);
  const [published, setPublished] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // AI generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<Question[]>([]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const toast = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleAiGenerate = () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiGenerated([]);
    setTimeout(() => {
      const generated: Question[] = Array.from({ length: aiCount }, (_, i) => ({
        id: nextId++,
        type: i % 3 === 2 ? 'text' : i % 3 === 1 ? 'multiple' : 'single',
        text: `${aiTopic} тақырыбы бойынша ${i + 1}-сұрақ: бұл тақырыптың негізгі ұғымдарын түсіндіріңіз.`,
        options: i % 3 !== 2 ? [
          { id: nextOptId++, text: 'Дұрыс жауап нұсқасы', isCorrect: true },
          { id: nextOptId++, text: 'Бұрыс жауап А', isCorrect: false },
          { id: nextOptId++, text: 'Бұрыс жауап Б', isCorrect: false },
        ] : [],
      }));
      setAiGenerated(generated);
      setAiLoading(false);
    }, 2000);
  };

  const addAiQuestionsToTest = () => {
    setQuestions(prev => [...prev, ...aiGenerated]);
    setAiGenerated([]);
    setAiTopic('');
    setActiveView('editor');
    toast();
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: nextId++,
      type,
      text: 'Жаңа сұрақ мәтінін осында жазыңыз...',
      options: type !== 'text' ? [
        { id: nextOptId++, text: 'А нұсқасы', isCorrect: false },
        { id: nextOptId++, text: 'Б нұсқасы', isCorrect: false },
      ] : [],
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const copyQuestion = (q: Question) => {
    const copy: Question = {
      ...q,
      id: nextId++,
      text: q.text + ' (көшірме)',
      options: q.options.map(o => ({ ...o, id: nextOptId++ })),
    };
    setQuestions(prev => [...prev, copy]);
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const addOption = (qId: number) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId
        ? { ...q, options: [...q.options, { id: nextOptId++, text: 'Жаңа нұсқа', isCorrect: false }] }
        : q
    ));
  };

  const deleteOption = (qId: number, optId: number) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options.filter(o => o.id !== optId) } : q
    ));
  };

  const updateOptionText = (qId: number, optId: number, text: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId
        ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o) }
        : q
    ));
  };

  const toggleCorrect = (qId: number, optId: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      if (q.type === 'single') {
        return { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optId })) };
      }
      return { ...q, options: q.options.map(o => o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o) };
    }));
  };

  const handlePublish = () => {
    setPublished(true);
    toast();
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex h-screen overflow-hidden">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-3 animate-pulse">
          <CheckCircle className="h-5 w-5" />
          Тест жарияланды!
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full">
        <Link to="/" className="p-6 border-b border-slate-200 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-[#4848e5] h-8 w-8 rounded-lg flex items-center justify-center text-white">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">LuminaPortal</h1>
        </Link>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Жұмыс кеңістігі</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveView('editor')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'editor' ? 'bg-[#4848e5]/10 text-[#4848e5]' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Ағымдағы жоба</span>
                <span className="ml-auto text-xs bg-[#4848e5] text-white rounded-full px-2 py-0.5">{questions.length}</span>
              </button>
              <button
                onClick={() => setActiveView('published')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'published' ? 'bg-[#4848e5]/10 text-[#4848e5]' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Жарияланған</span>
                {published && <span className="ml-auto text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5">1</span>}
              </button>
              <button
                onClick={() => setActiveView('archived')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'archived' ? 'bg-[#4848e5]/10 text-[#4848e5]' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Archive className="h-5 w-5" />
                <span className="text-sm">Мұрағатталған</span>
              </button>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Ресурстар</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveView('bank')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'bank' ? 'bg-[#4848e5]/10 text-[#4848e5]' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Database className="h-5 w-5" />
                <span className="text-sm">Сұрақтар банкі</span>
              </button>
              <button
                onClick={() => setActiveView('ai')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'ai' ? 'bg-[#4848e5]/10 text-[#4848e5]' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">ЖИ генераторы</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Пайдаланылған жад</span>
              <span className="text-xs font-bold text-slate-900">{Math.round((questions.length / 1000) * 100 + 64)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#4848e5] rounded-full transition-all" style={{ width: `${Math.round((questions.length / 1000) * 100 + 64)}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400">{questions.length + 647} / 1000 Сұрақ</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Басқару панелі</Link>
            <span className="text-sm font-semibold text-[#4848e5] border-b-2 border-[#4848e5] py-5">Тесттер</span>
            <Link to="/admin/results" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Аналитика</Link>
            <Link to="/admin/students" className="text-sm font-medium text-slate-600 hover:text-[#4848e5] transition-colors">Студенттер</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/student" className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold">
              <Users className="h-4 w-4" />
              Студент порталы
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
            </button>
            <Link to="/profile/settings" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} className="h-8 w-8 rounded-full bg-[#4848e5]/10 border border-[#4848e5]/20 overflow-hidden hover:ring-2 hover:ring-[#4848e5]/50 transition-all">
              <img alt="Profile" className="h-full w-full object-cover" src="https://i.pravatar.cc/150?img=32" />
            </button>
          </div>
        </header>

        {/* All Views Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">

            {/* ─── PUBLISHED VIEW ─── */}
            {activeView === 'published' && (
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Жарияланған тесттер</h2>
                {!published ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-semibold">Жарияланған тесттер жоқ</p>
                    <p className="text-sm text-slate-400 mt-1">Ағымдағы жобаға بلсْ "Жариялау" батырмасын басыңыз</p>
                    <button onClick={() => setActiveView('editor')} className="mt-4 px-6 py-2 bg-[#4848e5] text-white rounded-lg font-semibold text-sm hover:bg-[#4848e5]/90 transition-colors">Редакторға қайту</button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-emerald-200 p-6 flex items-center gap-5 shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{testTitle}</h3>
                      <p className="text-sm text-slate-500">{questions.length} сұрақ • Жарияланған</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Белсенді</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── ARCHIVED VIEW ─── */}
            {activeView === 'archived' && (
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Мұрағатталған тесттер</h2>
                {[
                  { title: 'Физика бойынша 2023', questions: 18, date: '2023-12-01' },
                  { title: 'Шетел қауіпсіздігі 2023', questions: 25, date: '2023-09-15' },
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <Archive className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{t.title}</h3>
                      <p className="text-sm text-slate-400">{t.questions} сұрақ • {t.date}</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">Қалпына әкелу</button>
                  </div>
                ))}
              </div>
            )}

            {/* ─── QUESTION BANK VIEW ─── */}
            {activeView === 'bank' && (
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Сұрақтар банкі</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { subject: 'Жоғары математика', count: 248, color: 'bg-blue-50 text-blue-600' },
                    { subject: 'Жоғары физика', count: 185, color: 'bg-purple-50 text-purple-600' },
                    { subject: 'Дүниежүзі тарихы', count: 132, color: 'bg-amber-50 text-amber-600' },
                    { subject: 'Ағылшылық шетелдері', count: 85, color: 'bg-emerald-50 text-emerald-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 ${s.color}`}>{s.subject}</div>
                      <p className="text-3xl font-black text-slate-900 mb-1">{s.count}</p>
                      <p className="text-sm text-slate-400">сұрақ</p>
                      <button
                        onClick={() => {
                          const q: Question = {
                            id: nextId++, type: 'single', text: `${s.subject} бойынша сұрақ`, options: [
                              { id: nextOptId++, text: 'Дұрыс жауап', isCorrect: true },
                              { id: nextOptId++, text: 'Бұрыс жауап', isCorrect: false },
                            ]
                          };
                          setQuestions(prev => [...prev, q]);
                          setActiveView('editor');
                        }}
                        className="mt-4 w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-[#4848e5] hover:text-white transition-colors"
                      >Тестке қосу</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── AI GENERATOR VIEW ─── */}
            {activeView === 'ai' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4848e5] to-violet-500 flex items-center justify-center text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Жасанды І (ЖИ) генераторы</h2>
                    <p className="text-slate-500 text-sm">Тақырыңызды енгізіңіз — жүйе сұрақтар автоматты жасалады</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                  <div className="mb-4">
                    <label className="text-sm font-bold text-slate-700 block mb-2">Тақырып / пән</label>
                    <input
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      placeholder="Мысалы: Кванттық механика, Ортағасыр дәуір, Термодинамика..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4848e5]/20 focus:border-[#4848e5] text-sm"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 block mb-2">Сұрақ саны: <span className="text-[#4848e5]">{aiCount}</span></label>
                    <input
                      type="range" min={1} max={15} value={aiCount}
                      onChange={e => setAiCount(Number(e.target.value))}
                      className="w-full accent-[#4848e5]"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>15</span></div>
                  </div>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !aiTopic.trim()}
                    className="w-full py-3 bg-gradient-to-r from-[#4848e5] to-violet-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <><span className="animate-spin">⟳</span> Жасалуда... </>
                    ) : (
                      <><Sparkles className="h-5 w-5" /> Сұрақтар жасау</>
                    )}
                  </button>
                </div>
                {aiGenerated.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900">Жасалған сұрақтар ({aiGenerated.length})</h3>
                      <button
                        onClick={addAiQuestionsToTest}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                      >Тестке қосу →</button>
                    </div>
                    <div className="space-y-3">
                      {aiGenerated.map((q, i) => (
                        <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_LABELS[q.type].color}`}>{TYPE_LABELS[q.type].label}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">{i + 1}. {q.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── EDITOR VIEW ─── */}
            {activeView === 'editor' && <div>
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span>Тесттер</span>
                    <span>›</span>
                    <span className="text-[#4848e5] font-medium">Жаңа бағалау</span>
                  </div>
                  {editingTitle ? (
                    <input
                      autoFocus
                      value={testTitle}
                      onChange={e => setTestTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                      className="text-3xl font-extrabold text-slate-900 tracking-tight w-full border-b-2 border-[#4848e5] outline-none bg-transparent pb-1"
                    />
                  ) : (
                    <h2
                      className="text-3xl font-extrabold text-slate-900 tracking-tight cursor-pointer hover:text-[#4848e5] transition-colors"
                      onClick={() => setEditingTitle(true)}
                      title="Атауын өзгерту үшін басыңыз"
                    >
                      {testTitle} <span className="text-lg text-slate-400 font-normal">✎</span>
                    </h2>
                  )}
                  <p className="text-slate-500 mt-1">Сұрақтар қосу немесе деректерді импорттау арқылы бағалауды құрастырыңыз.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                    <Eye className="h-4 w-4" />
                    Алдын ала қарау
                  </button>
                  <button
                    onClick={handlePublish}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm ${published
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#4848e5] text-white hover:bg-[#4848e5]/90'
                      }`}
                  >
                    {published ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    {published ? 'Жарияланды' : 'Жариялау'}
                  </button>
                </div>
              </div>

              {/* Import Area */}
              <label className="bg-[#4848e5]/5 border-2 border-dashed border-[#4848e5]/30 rounded-xl p-10 flex flex-col items-center justify-center text-center mb-8 hover:bg-[#4848e5]/10 transition-colors cursor-pointer">
                <input type="file" className="hidden" accept=".json,.csv,.xlsx" onChange={() => alert('Файлды өңдеу жақында іске қосылады!')} />
                <div className="h-12 w-12 bg-[#4848e5]/10 text-[#4848e5] rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Файлдан импорттау</h3>
                <p className="text-slate-500 text-sm max-w-md mb-6">Сұрақтарды бірден жүктеп салу үшін Excel, CSV немесе JSON файлын осында тастаңыз.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 tracking-wider">.XLS</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 tracking-wider">.CSV</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 tracking-wider">.JSON</span>
                </div>
              </label>

              {/* Questions List */}
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-[#4848e5]" />
                  Сұрақтар ({questions.length})
                </h3>
              </div>

              <div className="space-y-6 mb-12">
                {questions.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <AlignLeft className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">Сұрақтар жоқ</p>
                    <p className="text-sm">Төмендегі батырмалардан сұрақ түрін танданыңыз</p>
                  </div>
                )}

                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#4848e5] rounded-l-xl transition-colors"></div>

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_LABELS[q.type].color}`}>
                          {TYPE_LABELS[q.type].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyQuestion(q)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          title="Көшіру"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Жою"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question text (editable) */}
                    <textarea
                      value={q.text}
                      onChange={e => updateQuestionText(q.id, e.target.value)}
                      rows={2}
                      className="w-full text-lg font-bold text-slate-900 mb-4 resize-none border border-transparent focus:border-[#4848e5]/40 focus:bg-slate-50 rounded-lg px-2 py-1 outline-none transition-all"
                    />

                    {/* Options */}
                    {q.type !== 'text' ? (
                      <div className="space-y-2">
                        {q.options.map(opt => (
                          <div
                            key={opt.id}
                            className={`flex items-center p-3 rounded-lg border gap-3 transition-colors ${opt.isCorrect ? 'border-[#4848e5] bg-[#4848e5]/5' : 'border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <button
                              onClick={() => toggleCorrect(q.id, opt.id)}
                              className="shrink-0 focus:outline-none"
                              title={opt.isCorrect ? 'Дұрыс жауап (басыңыз =жою)' : 'Дұрыс жауап ретінде белгілеу'}
                            >
                              {q.type === 'single' ? (
                                <Circle className={`h-4 w-4 ${opt.isCorrect ? 'text-[#4848e5] fill-[#4848e5]' : 'text-slate-300'}`} />
                              ) : (
                                <CheckSquare className={`h-4 w-4 ${opt.isCorrect ? 'text-[#4848e5] fill-[#4848e5]' : 'text-slate-300'}`} />
                              )}
                            </button>
                            <input
                              value={opt.text}
                              onChange={e => updateOptionText(q.id, opt.id, e.target.value)}
                              className="flex-1 text-sm bg-transparent outline-none font-medium"
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => deleteOption(q.id, opt.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(q.id)}
                          className="flex items-center justify-center w-full p-3 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer transition-colors text-sm font-medium"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Нұсқа қосу
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                        <p className="text-sm text-slate-400 italic">Студент мұнда еркін мәтін жазады. Максималды таңбалар: 5000.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Panel */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-12">
                <div className="text-center mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Сұрақ түрін таңдау</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => addQuestion('single')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-[#4848e5] hover:bg-[#4848e5]/5 transition-all group"
                  >
                    <Circle className="h-6 w-6 text-slate-400 group-hover:text-[#4848e5] mb-3" />
                    <span className="font-bold text-slate-700 group-hover:text-[#4848e5]">Бір таңдау</span>
                    <span className="text-xs text-slate-400 mt-1">Радио батырмалары</span>
                  </button>
                  <button
                    onClick={() => addQuestion('multiple')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-[#4848e5] hover:bg-[#4848e5]/5 transition-all group"
                  >
                    <CheckSquare className="h-6 w-6 text-slate-400 group-hover:text-[#4848e5] mb-3" />
                    <span className="font-bold text-slate-700 group-hover:text-[#4848e5]">Бірнеше таңдау</span>
                    <span className="text-xs text-slate-400 mt-1">Checkbox батырмалары</span>
                  </button>
                  <button
                    onClick={() => addQuestion('text')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-[#4848e5] hover:bg-[#4848e5]/5 transition-all group"
                  >
                    <AlignLeft className="h-6 w-6 text-slate-400 group-hover:text-[#4848e5] mb-3" />
                    <span className="font-bold text-slate-700 group-hover:text-[#4848e5]">Еркін мәтін</span>
                    <span className="text-xs text-slate-400 mt-1">Параграф өрісі</span>
                  </button>
                </div>
                <button
                  onClick={() => addQuestion('single')}
                  className="w-full py-4 bg-[#4848e5] text-white rounded-xl font-bold text-lg hover:bg-[#4848e5]/90 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="h-6 w-6" />
                  Сұрақ қосу
                </button>
              </div>
            </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
