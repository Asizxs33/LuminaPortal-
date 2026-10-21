import React from 'react';
import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

type Step = { label: string; detail?: string; state: 'done' | 'current' | 'next' };

export default function LearningRoute({ steps }: { steps: Step[] }) {
  return (
    <View accessibilityRole="progressbar" style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((step, index) => {
        const done = step.state === 'done';
        const current = step.state === 'current';
        const color = done ? '#16845B' : current ? '#315CF5' : '#AAB4C5';
        return (
          <React.Fragment key={`${step.label}-${index}`}>
            <View style={{ alignItems: 'center', width: 92 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#DDF6EA' : current ? '#315CF5' : '#EEF1F6', borderWidth: current ? 0 : 1, borderColor: done ? '#9ADDBF' : '#D9E0EC' }}>
                {done ? <Check size={16} color="#16845B" strokeWidth={3} /> : <Text style={{ color: current ? 'white' : '#69758B', fontWeight: '900', fontSize: 12 }}>{index + 1}</Text>}
              </View>
              <Text numberOfLines={2} style={{ color, fontWeight: current ? '900' : '700', fontSize: 12, textAlign: 'center', marginTop: 7 }}>{step.label}</Text>
              {!!step.detail && <Text style={{ color: '#8A94A6', fontSize: 10, textAlign: 'center', marginTop: 2 }}>{step.detail}</Text>}
            </View>
            {index < steps.length - 1 && <View style={{ flex: 1, height: 3, borderRadius: 3, backgroundColor: done ? '#9ADDBF' : '#D9E0EC', marginTop: 14, minWidth: 18 }} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}
