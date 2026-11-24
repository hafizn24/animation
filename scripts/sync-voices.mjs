import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Keeps Season 1 audio-script.json voice fields in sync with generate_tts.py.
 * Rewrites only the voice strings, preserving the hand-formatted JSON layout.
 */
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const CAST_VOICE = {
  narrator: 'voice_6',
  bos: 'voice_3',
  jurulatih: 'voice_2',
  peguam: 'voice_2',
  azam: 'voice_5',
  farid: 'voice_4',
  danial: 'voice_6',
  zaki: 'voice_2',
  pakdin: 'voice_1',
  rayyan: 'voice_4',
  bob: 'voice_5',
  malik: 'voice_3',
  besikeeper: 'voice_2',
  pengadil: 'voice_2',
};

const SPEAKER_VOICE = {
  NARRATOR: 'voice_6',
  BOS: 'voice_3',
  JURULATIH: 'voice_2',
  PEGUAM: 'voice_2',
  AZAM: 'voice_5',
  FARID: 'voice_4',
  DANIAL: 'voice_6',
  'KAPTEN ZAKI': 'voice_2',
  'PAK DIN': 'voice_1',
  RAYAN: 'voice_4',
  RAYYAN: 'voice_4',
  'KAPTEN BOB': 'voice_5',
  'KAPTEN MALIK': 'voice_3',
  'PENJAGA GOL BESI': 'voice_2',
  PENGADIL: 'voice_2',
};

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (let ep = 6; ep <= 12; ep += 1) {
  const file = path.join(root, 'episodes', `episode-${ep}`, 'audio-script.json');
  let text = fs.readFileSync(file, 'utf8');

  for (const [key, voice] of Object.entries(CAST_VOICE)) {
    text = text.replace(
      new RegExp(`("${escape(key)}":\\s*\\{[^{}]*?"voice":\\s*")[^"]+(")`),
      `$1${voice}$2`
    );
  }
  for (const [speaker, voice] of Object.entries(SPEAKER_VOICE)) {
    text = text.replace(
      new RegExp(`("speaker":\\s*"${escape(speaker)}",[\\s\\S]*?"voice":\\s*")[^"]+(")`, 'g'),
      `$1${voice}$2`
    );
  }
  fs.writeFileSync(file, text);
  console.log(`voices synced: episode-${ep}`);
}
