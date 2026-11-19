"""Generate lightweight procedural SFX and BGM beds for the Buluh FC episodes.

Pure standard library (wave/math/random) so no extra dependencies are needed.
Every bed is deterministic and short enough to loop inside a Remotion <Audio>.

Usage: python scripts/generate_audio_beds.py
"""

import math
import random
import struct
import wave
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
SFX_DIR = PROJECT / "public" / "audio" / "sfx"
BGM_DIR = PROJECT / "public" / "audio" / "bgm"
SR = 22050
TAU = math.pi * 2


def write_wav(path, samples):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        frames = bytearray()
        for value in samples:
            clipped = max(-1.0, min(1.0, value))
            frames.extend(struct.pack("<h", int(clipped * 32767)))
        wav.writeframes(frames)


def stamp(seconds=0.7):
    rnd = random.Random(11)
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        env = math.exp(-t * 11)
        noise = rnd.uniform(-1, 1) * math.exp(-t * 34)
        thud = math.sin(TAU * 74 * t) * 0.85 + math.sin(TAU * 48 * t) * 0.35
        out.append((thud + noise * 0.55) * env * 0.85)
    return out


def paper(seconds=0.7):
    rnd = random.Random(23)
    prev = 0.0
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        attack = min(1.0, t / 0.05)
        release = max(0.0, 1.0 - (t - 0.42) / 0.28)
        env = attack * release
        noise = rnd.uniform(-1, 1)
        high = noise - prev * 0.82
        prev = noise
        out.append(high * env * 0.25)
    return out


def door(seconds=1.1):
    rnd = random.Random(37)
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        thud = math.sin(TAU * 58 * t) * math.exp(-t * 9) * 0.9
        sweep = 420 - 240 * min(1.0, t / 0.7)
        creak = math.sin(TAU * sweep * t + math.sin(t * 30) * 0.6)
        creak *= math.exp(-t * 4.5) * 0.12
        grit = rnd.uniform(-1, 1) * math.exp(-t * 22) * 0.18
        out.append((thud + creak + grit) * 0.85)
    return out


def bell(seconds=1.4):
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        attack = min(1.0, t / 0.006)
        partials = (
            math.sin(TAU * 1046.5 * t) * 0.5
            + math.sin(TAU * 1568 * t) * 0.3
            + math.sin(TAU * 2093 * t) * 0.16
            + math.sin(TAU * 3136 * t) * 0.07
        )
        out.append(partials * attack * math.exp(-t * 3.2) * 0.5)
    return out


def tense_bed(seconds=14.0):
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        pulse = 0.55 + 0.45 * math.sin(TAU * 0.22 * t) ** 2
        low = math.sin(TAU * 55 * t) * 0.5 + math.sin(TAU * 82.4 * t) * 0.32
        shimmer = math.sin(TAU * 164.8 * t) * 0.08 * (0.5 + 0.5 * math.sin(TAU * 0.11 * t))
        out.append((low + shimmer) * pulse * 0.16)
    return out


def warm_bed(seconds=14.0):
    notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]
    step = 0.7
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        idx = int(t / step) % len(notes)
        local = t - int(t / step) * step
        freq = notes[idx]
        pluck = math.sin(TAU * freq * local) * math.exp(-local * 6.5) * 0.55
        pluck += math.sin(TAU * freq * 2 * local) * math.exp(-local * 11) * 0.14
        pad = (
            math.sin(TAU * 130.8 * t) * 0.12
            + math.sin(TAU * 196.0 * t) * 0.09
            + math.sin(TAU * 261.6 * t) * 0.07
        )
        out.append((pluck + pad) * 0.16)
    return out


def main():
    write_wav(SFX_DIR / "stamp.wav", stamp())
    write_wav(SFX_DIR / "paper.wav", paper())
    write_wav(SFX_DIR / "door.wav", door())
    write_wav(SFX_DIR / "bell.wav", bell())
    write_wav(BGM_DIR / "tense.wav", tense_bed())
    write_wav(BGM_DIR / "warm.wav", warm_bed())
    print("Wrote SFX and BGM beds to public/audio/sfx and public/audio/bgm")


if __name__ == "__main__":
    main()
