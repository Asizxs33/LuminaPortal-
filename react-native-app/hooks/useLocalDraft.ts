import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Local device drafts are namespaced by account and form. */
export function useLocalDraft<T>(key: string | null, value: T, restore: (value: T) => void) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  const pending = useRef<Promise<void>>(Promise.resolve());
  const skip = useRef(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    if (!key) return;
    AsyncStorage.getItem(key).then(raw => {
      if (raw && alive) { restoreRef.current(JSON.parse(raw)); setStatus('Құрылғыдағы жоба қалпына келтірілді'); }
    }).catch(() => { if (alive) setStatus('Жобаны оқу мүмкін болмады'); })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [key]);
  const serialized = JSON.stringify(value);
  useEffect(() => {
    if (!ready || !key || skip.current) return;
    pending.current = pending.current.catch(() => {}).then(() => AsyncStorage.setItem(key, serialized));
    pending.current.then(() => setStatus('Жоба осы құрылғыда сақталды')).catch(() => setStatus('Жоба сақталмады: құрылғы жады толуы мүмкін'));
  }, [serialized, key, ready]);
  const clear = async () => {
    skip.current = true;
    await pending.current.catch(() => {});
    if (key) await AsyncStorage.removeItem(key);
  };
  return { ready, status, clear };
}
