import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, BarChart3, ArrowRight, CheckCircle2, Users, FileText, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#4848e5]/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#4848e5]">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-black tracking-tight text-slate-900">LuminaPortal</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-bold text-slate-600 hover:text-[#4848e5] transition-colors cursor-pointer">Мүмкіндіктер</a>
            <a href="#solutions" onClick={(e) => { e.preventDefault(); document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-bold text-slate-600 hover:text-[#4848e5] transition-colors cursor-pointer">Шешімдер</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-bold text-slate-600 hover:text-[#4848e5] transition-colors cursor-pointer">Бағалар</a>
          </nav>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" state={{ from: { pathname: '/student' } }} className="hidden md:block text-sm font-bold text-slate-600 hover:text-[#4848e5] transition-colors">
                  Студент порталы
                </Link>
                <Link to="/login" state={{ from: { pathname: '/admin' } }} className="px-5 py-2.5 bg-[#4848e5] text-white text-sm font-bold rounded-lg hover:bg-[#4848e5]/90 transition-all shadow-lg shadow-[#4848e5]/20">
                  Кіру
                </Link>
              </>
            ) : (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="hidden md:block text-sm font-bold text-slate-600 hover:text-[#4848e5] transition-colors">
                  Порталға өту
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Шығу
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#4848e5]/10 via-white to-white"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4848e5]/10 text-[#4848e5] text-sm font-bold mb-8">
              <SparklesIcon className="h-4 w-4" />
              <span>Жаңа буынды бағалау платформасы</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4848e5] to-purple-600">Дәлдікпен</span> және сенімділікпен бағалаңыз
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              LuminaPortal заманауи білім беру мекемелері мен кәсіпорындар үшін қауіпсіз, масштабталатын және интеллектуалды бағалау құралдарын ұсынады.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin" className="w-full sm:w-auto px-12 py-5 bg-[#4848e5] text-white text-2xl font-black rounded-2xl hover:bg-[#4848e5]/90 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-[#4848e5]/40 flex items-center justify-center gap-3">
                Бастау
                <ArrowRight className="h-7 w-7" />
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>ЖИ көмегімен бағалау</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>Анти-чит қауіпсіздігі</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>Нақты уақыт аналитикасы</span>
              </div>
            </div>
          </div>
        </section>

        {/* Screens Showcase */}
        <section className="py-24 bg-[#f6f6f8]" id="features">
          <div className="mx-auto max-w-[1536px] px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Платформа мүмкіндіктері</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Әкімшілер мен студенттерге арналған арнайы интерфейстерді ашыңыз.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <Link to="/admin" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#4848e5]/30 transition-all">
                <div className="h-14 w-14 bg-[#4848e5]/10 rounded-xl flex items-center justify-center text-[#4848e5] mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Тест конструкторы</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Сүйреп апару редакторы, сұрақтар банкі және ЖИ генерациялау құралдары арқылы күрделі бағалауларды оңай жасаңыз.</p>
                <div className="flex items-center text-[#4848e5] font-bold text-sm">
                  Админ порталын көру <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2 */}
              <Link to="/student" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#4848e5]/30 transition-all">
                <div className="h-14 w-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Студенттер панелі</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Студенттерге алдағы тесттерді көруге, үлгерімді бақылауға және материалдарға қол жеткізуге арналған таза, алаңдатпайтын орта.</p>
                <div className="flex items-center text-emerald-600 font-bold text-sm">
                  Студенттік порталды ашу <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3 */}
              <Link to="/results" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#4848e5]/30 transition-all">
                <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Аналитикалық жүйе</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Күшті диаграммалардың көмегімен өнімділік көрсеткіштері, ұпайларды үлестіру және әр студенттің нәтижесін терең талдаңыз.</p>
                <div className="flex items-center text-purple-600 font-bold text-sm">
                  Аналитиканы көру <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 4 */}
              <Link to="/test/math/start" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#4848e5]/30 transition-all">
                <div className="h-14 w-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Қауіпсіз тест ортасы</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Анти-чит шаралары, таймерлер және түсінікті сұрақ орналасуы бар нақты тест тапсыру интерфейсін көріңіз.</p>
                <div className="flex items-center text-amber-600 font-bold text-sm">
                  Демо тестті байқап көру <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Solutions Section (Placeholder for now) */}
        <section className="py-24 bg-white" id="solutions">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Біздің шешімдер</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Лайықты шешімдерді таңдаңыз.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-[#f6f6f8] rounded-2xl p-8 border border-slate-100 hover:border-[#4848e5]/30 hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-[#4848e5]/10 rounded-xl flex items-center justify-center text-[#4848e5] mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Университеттерге арналған</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Академиялық адалдықты сақтай отырып, мыңдаған студенттерге бір уақытта емтихан өткізуге арналған сенімді платформа.
                </p>
                <div className="flex items-center text-[#4848e5] font-bold text-sm cursor-pointer group">
                  Толығырақ <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="bg-[#f6f6f8] rounded-2xl p-8 border border-slate-100 hover:border-emerald-500/30 hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Бизнеске арналған</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Қызметкерлердің біліктілігін бағалау, корпоративтік оқыту және сертификаттау емтихандарын өткізуге өте ыңғайлы.
                </p>
                <div className="flex items-center text-emerald-600 font-bold text-sm cursor-pointer group">
                  Толығырақ <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="bg-[#f6f6f8] rounded-2xl p-8 border border-slate-100 hover:border-purple-500/30 hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Сертификаттау орталықтары</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Халықаралық стандарттарға сай келетін, жоғары деңгейде қорғалған кәсіби сертификаттау платформасы.
                </p>
                <div className="flex items-center text-purple-600 font-bold text-sm cursor-pointer group">
                  Толығырақ <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (Placeholder for now) */}
        <section className="py-24 bg-[#f6f6f8]" id="pricing">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Бағалар</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Барлық ұйымдарға арналған тарифтер.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {/* Basic Tier */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-[#4848e5]/30 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Негізгі</h3>
                <p className="text-slate-500 text-sm mb-6">Шағын топтар мен жеке мұғалімдер үшін</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">Тегін</span>
                </div>
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-600 text-sm">Айына 50 тестке дейін</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-600 text-sm">Негізгі конструктор</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-600 text-sm">Қарапайым аналитика</span>
                  </div>
                </div>
                <button className="w-full py-3 px-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Бастау
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#4848e5] rounded-2xl p-8 border border-[#4848e5] shadow-xl shadow-[#4848e5]/20 hover:-translate-y-1 transition-transform flex flex-col relative text-white">
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Ең танымал</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Кәсіби</h3>
                <p className="text-white/80 text-sm mb-6">Мектептер мен оқу орталықтары үшін</p>
                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-black">₸15,000</span>
                  <span className="text-white/80 ml-2">/айына</span>
                </div>
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-300" />
                    <span className="text-white/90 text-sm">Шексіз тесттер</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-300" />
                    <span className="text-white/90 text-sm">ЖИ сұрақ генераторы</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-300" />
                    <span className="text-white/90 text-sm">Анти-чит жүйесі</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-300" />
                    <span className="text-white/90 text-sm">Толық аналитика</span>
                  </div>
                </div>
                <button className="w-full py-3 px-4 bg-white text-[#4848e5] font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Жазылу
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-[#4848e5]/30 hover:shadow-xl transition-all flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Корпоративті</h3>
                <p className="text-slate-500 text-sm mb-6">Университеттер мен ірі компаниялар үшін</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">Жеке</span>
                </div>
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <span className="text-slate-600 text-sm">LMS интеграциясы (API)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <span className="text-slate-600 text-sm">Прокторинг қызметі</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <span className="text-slate-600 text-sm">Жеке домен (White-label)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <span className="text-slate-600 text-sm">24/7 басым қолдау</span>
                  </div>
                </div>
                <button className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  Байланысу
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-black tracking-tight">LuminaPortal</span>
          </div>
          <p className="text-sm font-medium">© 2026 LuminaPortal Inc. Барлық құқықтар қорғалған.</p>
        </div>
      </footer>
    </div >
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
