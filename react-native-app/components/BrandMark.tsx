import React from 'react';
import { Platform, Text, View, Image } from 'react-native';

export default function BrandMark({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  const color = inverse ? '#FFFCF7' : '#800F1D';
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Image source={require('../assets/brand/lumina-symbol.png')} accessibilityLabel="LuminaPortal" style={{ width: compact ? 42 : 54, height: compact ? 42 : 54, ...(inverse ? { tintColor: color } : {}) }} resizeMode="contain" />
    <View><Text style={{ color, fontFamily: Platform.OS === 'web' ? 'Georgia, Times New Roman, serif' : 'serif', fontSize: compact ? 21 : 26, fontWeight: '700', letterSpacing: -0.6 }}>LuminaPortal</Text>{!compact && <Text style={{ color: inverse ? '#E5CFC7' : '#8B6F61', fontSize: 11, marginTop: 3 }}>Білім. Бағалау. Даму.</Text>}</View>
  </View>;
}
