import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INFORMATICS_DURATION_MINUTES,
  INFORMATICS_PASSING_PERCENT,
  informaticsQuestions,
} from '../data/informaticsTest';
import { informatics2Questions } from '../data/informaticsTest2';
import BrandMark from '../components/BrandMark';
import LearningRoute from '../components/LearningRoute';

type Letter = 'A' | 'B' | 'C' | 'D';
type Answers = Record<number, Letter>;
const LETTERS: Letter[] = ['A', 'B', 'C', 'D'];
export default function InformaticsTest() {
  const router = useRouter();
  const { set } = useLocalSearchParams<{ set?: string }>();
  const second = set === '2';
  const questions = second ? informatics2Questions : informaticsQuestions;
  const total = questions.length;
  const storageKey = second ? 'informatics-test-2-last-result' : 'informatics-test-last-result';
  const { width } = useWindowDimensions();
  const [phase, setPhase] = useState<'intro' | 'taking' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [secondsLeft, setSecondsLeft] = useState(INFORMATICS_DURATION_MINUTES * 60);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [reviewOnlyErrors, setReviewOnlyErrors] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setLastScore(null);
    AsyncStorage.getItem(storageKey).then((value) => {
      if (value) {
        const saved = JSON.parse(value);
        if (typeof saved.score === 'number') setLastScore(saved.score);
      }
    }).catch(() => {});
  }, [storageKey]);

  useEffect(() => {
    setPhase('intro');
    setIndex(0);
    setAnswers({});
    setSecondsLeft(INFORMATICS_DURATION_MINUTES * 60);
  }, [second]);

  useEffect(() => {
    if (phase !== 'taking') return;
    if (secondsLeft <= 0) {
      setPhase('result');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  const score = useMemo(
    () => questions.reduce((count, q) => count + Number(answers[q.number] === q.correct), 0),
    [answers, questions],
  );

  useEffect(() => {
    if (phase !== 'result') return;
    AsyncStorage.setItem(storageKey, JSON.stringify({ score, total, completedAt: Date.now() })).catch(() => {});
    setLastScore(score);
  }, [phase, score, storageKey, total]);
  const answered = Object.keys(answers).length;
  const percent = Math.round((score / total) * 100);
  const current = questions[index];
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const imageWidth = Math.min(width - 48, 1115);

  const begin = () => {
    setAnswers({});
    setIndex(0);
    setSecondsLeft(INFORMATICS_DURATION_MINUTES * 60);
    setReviewOnlyErrors(false);
    setZoomed(false);
    setPhase('taking');
  };

  const finish = () => {
    setPhase('result');
  };

  const visibleQuestions = reviewOnlyErrors
    ? questions.filter((q) => answers[q.number] !== q.correct)
    : questions;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 1160, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <BrandMark compact />
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#D9E0EC' }}>
          <ArrowLeft size={18} color="#64748b" />
          <Text style={{ color: '#64748b', fontWeight: '700' }}>Назад</Text>
          </TouchableOpacity>
        </View>

        {phase === 'intro' && (
          <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 28, borderWidth: 1, borderColor: '#D9E0EC' }}>
            <Text style={{ color: '#315CF5', fontWeight: '800', fontSize: 13 }}>Тест из документа</Text>
            <Text style={{ color: '#16213E', fontSize: 32, fontWeight: '900', marginTop: 10 }}>Информатика · Тест {second ? '2' : '1'}</Text>
            <Text style={{ color: '#64748b', fontSize: 16, lineHeight: 24, marginTop: 12 }}>
              {total} вопросов с вариантами A–D. Вопросы сохранены в виде изображений, чтобы таблицы, код и формулы выглядели как в исходном документе.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <View style={{ backgroundColor: '#EEF1FF', borderRadius: 12, padding: 12 }}><Text style={{ color: '#315CF5', fontWeight: '800' }}>50 минут</Text></View>
              <View style={{ backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12 }}><Text style={{ color: '#047857', fontWeight: '800' }}>Проходной балл {INFORMATICS_PASSING_PERCENT}%</Text></View>
            </View>
            <View style={{ marginTop: 25, paddingTop: 22, borderTopWidth: 1, borderTopColor: '#E7EBF2' }}>
              <LearningRoute steps={[{ label: 'Дайындық', state: 'current' }, { label: 'Сұрақтар', state: 'next' }, { label: 'Нәтиже', state: 'next' }]} />
            </View>
            <Text style={{ color: '#64748b', lineHeight: 22, marginTop: 22 }}>
              {second
                ? 'Вопросы №26, №27 и №30 исключены: на снимках не видны все варианты ответа или формулировка. Ответы здесь выбираете вы.'
                : 'В вопросе №12 нет корректного варианта ответа, а на снимке №24 отсутствует формулировка. Они исключены из оценки. Отмеченные на старых скриншотах варианты скрыты; ответы здесь выбираете вы.'}
            </Text>
            {lastScore !== null && <Text style={{ color: '#334155', marginTop: 18, fontWeight: '700' }}>Последний результат: {lastScore} из {total}</Text>}
            <TouchableOpacity onPress={begin} style={{ marginTop: 30, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#315CF5', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14 }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Начать тест</Text><ArrowRight size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {phase === 'taking' && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <View><Text style={{ color: '#64748b', fontWeight: '700' }}>ИНФОРМАТИКА · ТЕСТ {second ? '2' : '1'}</Text><Text style={{ color: '#0f172a', fontSize: 25, fontWeight: '900' }}>Вопрос {index + 1} из {total}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: secondsLeft < 300 ? '#fef2f2' : '#eef2ff', borderRadius: 12, padding: 12 }}>
                <Clock3 size={18} color={secondsLeft < 300 ? '#dc2626' : '#4f46e5'} />
                <Text style={{ color: secondsLeft < 300 ? '#dc2626' : '#4f46e5', fontWeight: '900', fontSize: 17 }}>{minutes}:{seconds}</Text>
              </View>
            </View>
            <View style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 10, marginBottom: 18 }}><View style={{ width: `${(answered / total) * 100}%`, height: 8, backgroundColor: '#4f46e5', borderRadius: 10 }} /></View>
            <View style={{ backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', padding: 16 }}>
              <Text style={{ color: '#475569', fontWeight: '700', marginBottom: 12 }}>Задание №{current.number}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={zoomed} style={{ width: imageWidth - 32, alignSelf: 'center' }}>
                <Image source={current.image} resizeMode="contain" style={{ width: zoomed ? 1115 : imageWidth - 32, height: zoomed ? 460 : (imageWidth - 32) * (460 / 1115) }} accessibilityLabel={`Вопрос ${current.number} с вариантами A, B, C, D`} />
              </ScrollView>
              <TouchableOpacity onPress={() => setZoomed(!zoomed)} style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8 }}>
                <Text style={{ color: '#4f46e5', fontWeight: '800' }}>{zoomed ? 'Уменьшить изображение' : 'Увеличить изображение'}</Text>
              </TouchableOpacity>
              <Text style={{ color: '#475569', fontWeight: '700', marginTop: 12, marginBottom: 10 }}>Выберите ответ</Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {LETTERS.map((letter) => <TouchableOpacity key={letter} onPress={() => setAnswers((old) => ({ ...old, [current.number]: letter }))} accessibilityRole="radio" accessibilityState={{ selected: answers[current.number] === letter }} style={{ minWidth: 64, paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', backgroundColor: answers[current.number] === letter ? '#4f46e5' : '#f8fafc', borderWidth: 1, borderColor: answers[current.number] === letter ? '#4f46e5' : '#cbd5e1' }}><Text style={{ color: answers[current.number] === letter ? 'white' : '#334155', fontSize: 18, fontWeight: '900' }}>{letter}</Text></TouchableOpacity>)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
              <TouchableOpacity disabled={index === 0} onPress={() => setIndex(index - 1)} style={{ opacity: index === 0 ? 0.4 : 1, padding: 14, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1' }}><Text style={{ color: '#334155', fontWeight: '800' }}>← Назад</Text></TouchableOpacity>
              <TouchableOpacity onPress={index === total - 1 ? finish : () => setIndex(index + 1)} style={{ padding: 14, paddingHorizontal: 22, backgroundColor: '#4f46e5', borderRadius: 12 }}><Text style={{ color: 'white', fontWeight: '800' }}>{index === total - 1 ? 'Завершить' : 'Далее →'}</Text></TouchableOpacity>
            </View>
            <Text style={{ marginTop: 24, marginBottom: 12, color: '#64748b', fontWeight: '700' }}>Отвечено: {answered} из {total} · можно вернуться к любому вопросу</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {questions.map((q, i) => <TouchableOpacity key={q.number} onPress={() => setIndex(i)} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: i === index ? '#4f46e5' : answers[q.number] ? '#dcfce7' : 'white', borderWidth: 1, borderColor: i === index ? '#4f46e5' : answers[q.number] ? '#86efac' : '#e2e8f0' }}><Text style={{ color: i === index ? 'white' : '#334155', fontWeight: '800' }}>{q.number}</Text></TouchableOpacity>)}
            </View>
          </>
        )}

        {phase === 'result' && (
          <>
            <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 24, padding: 28 }}>
              <CheckCircle2 size={32} color={percent >= INFORMATICS_PASSING_PERCENT ? '#059669' : '#f59e0b'} />
              <Text style={{ color: '#0f172a', fontSize: 30, fontWeight: '900', marginTop: 12 }}>Результат: {score} из {total}</Text>
              <Text style={{ color: '#475569', marginTop: 8, fontSize: 17 }}>{percent}% · {percent >= INFORMATICS_PASSING_PERCENT ? 'Тест пройден' : 'Попробуйте ещё раз'}</Text>
              <Text style={{ color: '#64748b', marginTop: 6 }}>Без ответа: {total - answered}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
                <TouchableOpacity onPress={begin} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', borderRadius: 12, padding: 14 }}><RotateCcw size={17} color="white" /><Text style={{ color: 'white', fontWeight: '800' }}>Пройти снова</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setReviewOnlyErrors(!reviewOnlyErrors)} style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14 }}><Text style={{ color: '#334155', fontWeight: '800' }}>{reviewOnlyErrors ? 'Все вопросы' : 'Только ошибки'}</Text></TouchableOpacity>
              </View>
            </View>
            <Text style={{ color: '#0f172a', fontSize: 23, fontWeight: '900', marginTop: 30, marginBottom: 16 }}>Разбор ответов</Text>
            {visibleQuestions.map((q) => <View key={q.number} style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 }}>
              <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>Вопрос №{q.number}</Text>
              <Text style={{ color: answers[q.number] === q.correct ? '#059669' : '#dc2626', marginTop: 6, fontWeight: '700' }}>Ваш ответ: {answers[q.number] || 'нет'} · правильный: {q.correct}</Text>
              <Image source={q.image} resizeMode="contain" style={{ width: imageWidth - 36, height: (imageWidth - 36) * (460 / 1115), alignSelf: 'center', marginTop: 12 }} />
            </View>)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
