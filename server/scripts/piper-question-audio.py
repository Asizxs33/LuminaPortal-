"""Generate a five-question Kazakh pilot for import-question-audio.ts."""
import argparse
import base64
import io
import json
from pathlib import Path
import subprocess
import wave

from piper import PiperVoice, SynthesisConfig


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('model', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--speaker', type=int, default=0)
    args = parser.parse_args()

    if args.destination.exists():
        parser.error('Choose a new destination file.')
    bundle = json.loads(args.source.read_text(encoding='utf-8-sig'))
    if bundle.get('format') != 'lumina-test' or bundle.get('version') != 1:
        parser.error('Expected a Lumina test export.')
    test = next((test for test in bundle['package']['tests'] if test['language'] == 'kk'), None)
    if not test or not test['questions']:
        parser.error('No Kazakh questions found.')

    questions = test['questions'][:5]
    labels = [f'Жауап нұсқасы {chr(65 + index)}.' for index in range(max(len(q['options']) for q in questions))]
    voice = PiperVoice.load(str(args.model))
    config = SynthesisConfig(speaker_id=args.speaker, length_scale=1.10)
    cache = {}

    def encode(text):
        if text not in cache:
            wav = io.BytesIO()
            with wave.open(wav, 'wb') as output:
                voice.synthesize_wav(text, output, syn_config=config)
            audio = subprocess.run(
                ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'wav', '-i', 'pipe:0',
                 '-codec:a', 'libmp3lame', '-b:a', '48k', '-f', 'mp3', 'pipe:1'],
                input=wav.getvalue(), stdout=subprocess.PIPE, check=True, timeout=30,
            ).stdout
            if not 0 < len(audio) <= 100_000:
                raise ValueError('Recording is empty or exceeds the site limit.')
            cache[text] = base64.b64encode(audio).decode('ascii')
        return cache[text]

    recordings = {'labels': [encode(label) for label in labels], 'questions': {}}
    for question in questions:
        recordings['questions'][str(question['id'])] = {
            'question': encode(question['text']),
            'options': {str(option['id']): encode(option['text']) for option in question['options']},
        }
    bundle['audio'] = {test['id']: recordings}
    with args.destination.open('x', encoding='utf-8') as output:
        json.dump(bundle, output, ensure_ascii=False, separators=(',', ':'))
    print(f'Generated {len(questions)} questions and {len(cache)} unique recordings.')


if __name__ == '__main__':
    main()
