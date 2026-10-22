export function gradeChoice(question: any, options: any[], selected: unknown) {
  const chosen = options.find(option => String(option.id) === String(selected));
  const correct = options.filter(option => option.is_correct);
  return { question_id: question.id, type: question.type, text: question.text, image_url: question.image_url, selected: chosen?.text || null, correct: correct.map(option => option.text).join(' / '), is_correct: Boolean(chosen?.is_correct) };
}
