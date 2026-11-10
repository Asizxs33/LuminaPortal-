import {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Square, Volume2} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API} from '../app/constants/api';
import {speakQuestion, stopQuestionSpeech} from '../lib/questionSpeech';

export default function QuestionSpeech({language, text, options, testId, questionId, attemptToken}: {
  language?: string;
  text: string;
  options: {id: number; text: string}[];
  testId: string;
  questionId: number;
  attemptToken: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [attribution, setAttribution] = useState(false);
  const request = useRef<AbortController | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const cached = useRef<{key: string; clips: string[]} | null>(null);

  function stop() {
    request.current?.abort();
    request.current = null;
    const audio = player.current;
    player.current = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    stopQuestionSpeech();
  }

  useEffect(() => {
    window.speechSynthesis?.getVoices();
    return stop;
  }, []);

  async function toggle() {
    if (playing || request.current) {
      stop();
      setPlaying(false);
      return;
    }
    setMessage('');
    setAttribution(false);
    if (language === 'kk' && attemptToken) {
      const controller = new AbortController();
      request.current = controller;
      setPlaying(true);
      const key = JSON.stringify([attemptToken, text, options.map(option => [option.id, option.text])]);
      let clips = cached.current?.key === key ? cached.current.clips : undefined;
      try {
        if (!clips) {
          const token = await AsyncStorage.getItem('lumina_token');
          const response = await fetch(`${API}/api/tests/${encodeURIComponent(testId)}`, {
            method: 'POST',
            headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'question-audio', attempt_token: attemptToken, question_id: questionId, option_ids: options.map(option => option.id)}),
            signal: controller.signal,
          });
          if (response.ok) {
            const result = await response.json();
            if (Array.isArray(result.clips) && result.clips.length === 1 + options.length * 2 && result.clips.every((clip: unknown) => typeof clip === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(clip))) {
              clips = result.clips as string[];
              cached.current = {key, clips};
            }
          }
        }
      } catch {
        // An unavailable recording should not prevent the device voice from working.
      } finally {
        if (request.current === controller) request.current = null;
      }
      if (controller.signal.aborted) return;
      if (clips) {
        const audio = new Audio();
        const queue = clips;
        let index = 0;
        player.current = audio;
        const failed = () => {
          if (player.current !== audio) return;
          stop();
          setPlaying(false);
          setMessage('Жазба ойнатылмады. Тыңдау батырмасын қайта басыңыз.');
        };
        const next = () => {
          if (player.current !== audio) return;
          if (index === queue.length) {
            stop();
            setPlaying(false);
            return;
          }
          audio.src = `data:audio/mpeg;base64,${queue[index++]}`;
          void audio.play().catch(failed);
        };
        audio.addEventListener('ended', next);
        audio.addEventListener('error', failed);
        setAttribution(true);
        next();
        return;
      }
    }
    const started = speakQuestion(language, text, options, () => setPlaying(false), () => {
      setPlaying(false);
      setMessage('Дыбыстау сәтсіз аяқталды. Қайта көріңіз.');
    });
    setPlaying(started);
    if (!started) setMessage('Бұл тілде жергілікті дауыс қолжетімсіз. Құрылғының дыбыстау баптауларын тексеріңіз.');
  }

  return <View style={{marginBottom: 12, gap: 6}}>
    <TouchableOpacity accessibilityRole="button" onPress={toggle} style={{alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FBEEF1'}}>
      {playing ? <Square size={17} color="#990F2E"/> : <Volume2 size={19} color="#990F2E"/>}
      <Text style={{color: '#800F1D', fontWeight: '600'}}>{playing ? 'Оқуды тоқтату' : 'Сұрақты тыңдау'}</Text>
    </TouchableOpacity>
    {!!message && <Text accessibilityRole="alert" style={{color: '#615455'}}>{message}</Text>}
    {attribution && <Text style={{fontSize: 12, color: '#615455'}}>Piper · ISSAI KazakhTTS2 (CC BY 4.0)</Text>}
  </View>;
}
