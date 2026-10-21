import React from 'react';
import { Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';

export default function BrandMark({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
      <View style={{ width: compact ? 36 : 42, height: compact ? 36 : 42, borderRadius: 12, backgroundColor: inverse ? 'rgba(255,255,255,0.14)' : '#315CF5', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={compact ? 18 : 21} color="white" strokeWidth={2.4} />
      </View>
      <View>
        <Text style={{ color: inverse ? 'white' : '#16213E', fontSize: compact ? 16 : 19, fontWeight: '900', letterSpacing: -0.4 }}>LuminaPortal</Text>
        {!compact && <Text style={{ color: inverse ? '#C8D4FF' : '#69758B', fontSize: 11, fontWeight: '700', marginTop: 1 }}>Бағалау платформасы</Text>}
      </View>
    </View>
  );
}
