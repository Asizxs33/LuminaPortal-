const locales: Record<string, string> = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' };

export function stopQuestionSpeech() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

export function speakQuestion(
  language: string | undefined,
  question: string,
  options: readonly { text: string }[],
  onDone: () => void,
  onError: () => void,
): boolean {
  const speech = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!speech || typeof SpeechSynthesisUtterance === 'undefined') return false;

  const locale = locales[language ?? ''] ?? 'kk-KZ';
  const voices = speech.getVoices().filter(voice =>
    voice.localService && voice.lang.toLowerCase().split(/[-_]/)[0] === locale.slice(0, 2),
  );
  const voice = voices.find(item => /natural|neural|premium|enhanced/i.test(item.name)) ?? voices[0];
  if (!voice) return false;

  stopQuestionSpeech();
  const label = locale === 'kk-KZ' ? 'Жауап нұсқасы' : locale === 'ru-RU' ? 'Вариант' : 'Option';
  const parts = [question, ...options.map((option, i) => `${label} ${String.fromCharCode(65 + i)}. ${option.text}`)];
  // Short utterances allow pauses between options and avoid browser limits on long speech.
  const chunks = parts.flatMap(part => part.trim().match(/.{1,220}(?:\s|$)|.{1,220}/gs) ?? []);
  const utterances = chunks.map(chunk => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.87;
    return utterance;
  });
  if (!utterances.length) return false;
  utterances.at(-1)!.onend = onDone;
  for (const utterance of utterances) {
    utterance.onerror = event => {
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      stopQuestionSpeech();
      onError();
    };
    speech.speak(utterance);
  }
  return true;
}
