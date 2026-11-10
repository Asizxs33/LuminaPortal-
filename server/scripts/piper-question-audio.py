"""Generate a five-question Kazakh pilot for import-question-audio.ts."""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import subprocess
import wave

from piper import PiperVoice, SynthesisConfig
from piper.config import PiperConfig
from onnxruntime import InferenceSession, SessionOptions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('model', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--speaker', type=int, default=0)
    parser.add_argument('--all', action='store_true', help='Generate the full bank for the website.')
    args = parser.parse_args()

    if args.destination.exists():
        parser.error('Choose a new destination file.')
    bundle = json.loads(args.source.read_text(encoding='utf-8-sig'))
    if bundle.get('format') != 'lumina-test' or bundle.get('version') != 1:
        parser.error('Expected a Lumina test export.')
    test = next((test for test in bundle['package']['tests'] if test['language'] == 'kk'), None)
    if not test or not test['questions']:
        parser.error('No Kazakh questions found.')

    questions = test['questions'] if args.all else test['questions'][:5]
    labels = [f'Жауап нұсқасы {chr(65 + index)}.' for index in range(max(len(q['options']) for q in questions))]
    settings = SessionOptions()
    settings.intra_op_num_threads = 2
    settings.inter_op_num_threads = 1
    model_config = json.loads(Path(f'{args.model}.json').read_text(encoding='utf-8'))
    voice = PiperVoice(
        session=InferenceSession(str(args.model), sess_options=settings, providers=['CPUExecutionProvider']),
        config=PiperConfig.from_dict(model_config),
    )
    config = SynthesisConfig(speaker_id=args.speaker, length_scale=1.10)
    cache = {}
    cache_dir = args.destination.with_suffix('.clips')
    cache_dir.mkdir(parents=True, exist_ok=True)

    def encode(text):
        if text not in cache:
            identity = json.dumps([args.model.name, args.speaker, 1.10, text], ensure_ascii=False)
            filename = cache_dir / (hashlib.sha256(identity.encode('utf-8')).hexdigest() + '.mp3')
            if filename.is_file():
                audio = filename.read_bytes()
                if 0 < len(audio) <= 100_000:
                    cache[text] = base64.b64encode(audio).decode('ascii')
                    return cache[text]
            wav = io.BytesIO()
            with wave.open(wav, 'wb') as output:
                voice.synthesize_wav(text, output, syn_config=config)
            audio = subprocess.run(
                ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'wav', '-i', 'pipe:0',
                 '-codec:a', 'libmp3lame', '-b:a', '48k', '-f', 'mp3', 'pipe:1'],
                input=wav.getvalue(), stdout=subprocess.PIPE, check=True, timeout=30,
            ).stdout
            if not 0 < len(audio) <= 300_000:
                raise ValueError('Recording is empty or exceeds the site limit.')
            filename.write_bytes(audio)
            cache[text] = base64.b64encode(audio).decode('ascii')
        return cache[text]

    recordings = {'labels': [encode(label) for label in labels], 'questions': {}}
    for index, question in enumerate(questions, 1):
        recordings['questions'][str(question['id'])] = {
            'question': encode(question['text']),
            'options': {str(option['id']): encode(option['text']) for option in question['options']},
        }
        if index % 25 == 0:
            print(f'Generated {index}/{len(questions)} questions.', flush=True)
    bundle['audio'] = {test['id']: recordings}
    with args.destination.open('x', encoding='utf-8') as output:
        json.dump(bundle, output, ensure_ascii=False, separators=(',', ':'))
    print(f'Generated {len(questions)} questions and {len(cache)} unique recordings.')


if __name__ == '__main__':
    main()
