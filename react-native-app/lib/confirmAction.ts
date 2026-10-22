import { Alert } from 'react-native';
export function confirmAction(message: string, options: {title?: string; confirmLabel?: string} = {}): Promise<boolean> {
  return new Promise(resolve => Alert.alert(options.title || 'Растау', message, [
    {text:'Бас тарту', style:'cancel', onPress:()=>resolve(false)},
    {text:options.confirmLabel || 'Растау', onPress:()=>resolve(true)},
  ], {cancelable:true, onDismiss:()=>resolve(false)}));
}
