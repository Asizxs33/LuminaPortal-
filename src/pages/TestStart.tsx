import React from 'react';
import { ShieldCheck, HelpCircle, Timer, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { mockTests } from '../data/mockTests';

export default function TestStart() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const test = id ? mockTests[id] : null;

  if (!test) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Тест табылмады</h2>
          <button onClick={() => navigate('/student')} className="px-6 py-2 bg-[#4848e5] text-white rounded-lg">Басқару панеліне оралу</button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 md:px-20 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="text-[#4848e5] flex items-center justify-center">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight">Бағалау порталы</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-12 px-6">
        <div className="flex flex-col max-w-[800px] flex-1">
          <div className="mb-10 text-center">
            <h1 className="text-slate-900 text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">Бастамас бұрын</h1>
            <p className="text-slate-600 text-lg">Ережелермен танысып, ортаңыздың дайын екеніне көз жеткізіңіз.</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="h-64 bg-slate-200 relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1600')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <span className="px-3 py-1 bg-[#4848e5] rounded-full text-xs font-bold uppercase tracking-wider">Сертификаттау емтиханы</span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#4848e5]/10 flex items-center justify-center text-[#4848e5]">
                  <Timer className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Уақыт шектеуі</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    <span className="font-bold text-slate-900">Барлығы {test.durationMinutes} минут.</span> Төмендегі түймені басқан бойда таймер іске қосылады.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Анти-читерлік саясат</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    <span className="font-bold text-slate-900">Қойындыларды ауыстырмаңыз немесе терезені кішірейтпеңіз</span>, әйтпесе тест автоматты түрде аяқталып, ағымдағы нәтижеңіз жіберіледі.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Жүйені тексеру</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Сіздің камераңыз бен микрофоныңыз тексерілді. Тыныш, жарық бөлмеде екеніңізге көз жеткізіңіз.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <Link to={`/test/${test.id}/take`} className="w-full max-w-[480px] flex items-center justify-center rounded-xl h-16 px-10 bg-[#4848e5] text-white text-xl font-black leading-normal tracking-wide shadow-lg shadow-[#4848e5]/30 hover:bg-[#4848e5]/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Тестті бастау
            </Link>
            <div className="flex items-center gap-2 text-slate-500">
              <Info className="h-4 w-4" />
              <p className="text-sm font-medium leading-normal">
                Бастау түймесін басу арқылы сіз бағалау шарттарымен келісесіз.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 pt-8">
            <div className="text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Сұрақтар</p>
              <p className="text-xl font-bold text-slate-900">{test.questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Өту ұпайы</p>
              <p className="text-xl font-bold text-slate-900">{test.passScorePercentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Мүмкіндіктер</p>
              <p className="text-xl font-bold text-slate-900">1 / 1</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Формат</p>
              <p className="text-xl font-bold text-slate-900">Бірнеше таңдау</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-10 border-t border-slate-200 text-center text-slate-400 text-xs">
        © 2026 Assessment Portal Secure Systems. Барлық құқықтар қорғалған.
      </footer>
    </div>
  );
}
