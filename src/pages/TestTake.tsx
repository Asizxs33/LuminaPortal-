import React, { useState } from 'react';
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mockTests } from '../data/mockTests';

export default function TestTake() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const test = id ? mockTests[id] : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(test ? test.durationMinutes * 60 : 0);

  // Simulate anti-cheat by listening to visibility change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        navigate('/locked');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  // Timer countdown hook
  React.useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleFinish(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (!test) return;

    let score = 0;
    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionId) {
        score += 1;
      }
    });

    navigate(`/test/${test.id}/result`, {
      state: {
        score,
        total: test.questions.length
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#4848e5]/10 flex items-center justify-center text-[#4848e5]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{test.title}</h1>
            <p className="text-sm text-slate-500">{test.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button onClick={handleFinish} className="px-6 py-2 bg-[#4848e5] text-white rounded-lg font-semibold hover:bg-[#4848e5]/90 transition-colors">
            Ерте аяқтау
          </button>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-12 px-6">
        <div className="w-full max-w-3xl flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#4848e5]/10 text-[#4848e5] rounded-full text-xs font-bold uppercase tracking-wider">
                {currentQuestionIndex + 1}-сұрақ
              </span>
              <span className="text-slate-500 text-sm font-medium">Бірнеше таңдау</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-snug">
              {currentQuestion.text}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === option.id;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D...

                return (
                  <label
                    key={option.id}
                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                      ? 'border-[#4848e5] bg-[#4848e5]/5'
                      : 'border-slate-200 hover:border-[#4848e5]/50'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleOptionSelect(option.id)}
                    />
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full border-2 mr-4 ${isSelected ? 'border-[#4848e5] bg-[#4848e5]' : 'border-slate-300'
                      }`}>
                      {isSelected && <div className="h-2 w-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-lg">{option.text}</p>
                      <p className="text-slate-500 text-sm">{letter} нұсқасы</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-6 w-6 text-[#4848e5]" />}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">{currentQuestionIndex + 1}-СҰРАҚ <span className="text-slate-500 font-normal">БАРЛЫҒЫ {test.questions.length}</span></span>
                <span className="text-sm font-bold text-[#4848e5]">{Math.round(((currentQuestionIndex + 1) / test.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#4848e5] rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${currentQuestionIndex === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-5 w-5" />
                Артқа
              </button>

              {isLastQuestion ? (
                <button onClick={handleFinish} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  Аяқтау
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-[#4848e5] text-white rounded-lg font-semibold hover:bg-[#4848e5]/90 transition-colors">
                  Келесі
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
