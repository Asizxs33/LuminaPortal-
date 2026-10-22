import React from 'react';
import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

type Step = { label: string; detail?: string; state: 'done' | 'current' | 'next' };

export default function LearningRoute({ steps }: { steps: Step[] }) {
  return (
    <View accessibilityLabel={steps.map(step => `${step.label}: ${step.state === 'done' ? 'аяқталды' : step.state === 'current' ? 'қазір' : 'келесі'}`).join(', ')} style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((step, index) => {
        const done = step.state === 'done';
        const current = step.state === 'current';
        const color = done ? '#16845B' : current ? '#800F1D' : '#756D70';
        return (
          <React.Fragment key={`${step.label}-${index}`}>
            <View style={{ alignItems: 'center', flex: 1, maxWidth: 92, minWidth: 0 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#DDF6EA' : current ? '#800F1D' : '#F3EDE4', borderWidth: current ? 0 : 1, borderColor: done ? '#9ADDBF' : '#DFD2C3' }}>
                {done ? <Check size={16} color="#16845B" strokeWidth={3} /> : <Text style={{ color: current ? 'white' : '#756D70', fontWeight: '700', fontSize: 12 }}>{index + 1}</Text>}
              </View>
              <Text style={{ color, fontWeight: current ? '700' : '500', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 7 }}>{step.label}</Text>
              {!!step.detail && <Text style={{ color: '#A29792', fontSize: 10, textAlign: 'center', marginTop: 2 }}>{step.detail}</Text>}
            </View>
            {index < steps.length - 1 && <View style={{ flex: 0.5, height: 3, borderRadius: 3, backgroundColor: done ? '#9ADDBF' : '#DFD2C3', marginTop: 14, minWidth: 8 }} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}
