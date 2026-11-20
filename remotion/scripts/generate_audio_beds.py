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


def kick(seconds=0.7):
    """Episode 3 frame-0 leather strike + bass transient."""
    rnd = random.Random(101)
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        crack = rnd.uniform(-1, 1) * math.exp(-t * 55) * 0.45
        body = math.sin(TAU * 96 * t - t * 40) * math.exp(-t * 17) * 0.75
        bass = math.sin(TAU * 44 * t) * math.exp(-t * 9) * 0.55
        out.append((crack + body + bass) * 0.95)
    return out


def whoosh(seconds=0.8):
    """Episode 3 ball flight whoosh."""
    rnd = random.Random(137)
    prev = 0.0
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        env = math.sin(math.pi * min(1.0, t / seconds)) ** 1.4
        noise = rnd.uniform(-1, 1)
        cutoff = 0.16 + 0.62 * min(1.0, t / seconds)
        prev += cutoff * (noise - prev)
        out.append((noise - prev) * env * 0.6 + math.sin(TAU * 320 * t) * env * 0.06)
    return out


def net(seconds=0.9):
    """Episode 3 net ripple — snapping cords then a shimmering release."""
    rnd = random.Random(149)
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        snap = rnd.uniform(-1, 1) * math.exp(-t * 24) * 0.5
        shimmer = (
            math.sin(TAU * 2100 * t) * 0.22
            + math.sin(TAU * 3150 * t) * 0.14
            + math.sin(TAU * 525 * t) * 0.18
        )
        wobble = 0.6 + 0.4 * math.sin(TAU * 17 * t)
        out.append((snap + shimmer * wobble) * math.exp(-t * 5.2) * 0.85)
    return out


def crowd(seconds=3.0, intensity=0.5, seed=211):
    """Episode 3 escalating stadium cheer."""
    rnd = random.Random(seed)
    out = []
    smooth_noise = 0.0
    for i in range(int(SR * seconds)):
        t = i / SR
        attack = min(1.0, t / 0.18)
        release = min(1.0, max(0.0, (seconds - t) / 0.55))
        swell = 0.55 + 0.45 * math.sin(TAU * 1.7 * t) ** 2
        noise = rnd.uniform(-1, 1)
        smooth_noise += 0.045 * (noise - smooth_noise)
        voices = (
            math.sin(TAU * 196 * t + math.sin(t * 7) * 0.7) * 0.12
            + math.sin(TAU * 293.7 * t + math.sin(t * 5) * 0.5) * 0.08
        )
        out.append((smooth_noise * 1.7 + voices + noise * 0.12) * attack * release * swell * intensity)
    return out


def whistle(seconds=1.1):
    """Episode 3 referee final whistle."""
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        attack = min(1.0, t / 0.02)
        release = min(1.0, max(0.0, (seconds - t) / 0.2))
        trill = 1.0 + 0.18 * math.sin(TAU * 14 * t)
        tone = (
            math.sin(TAU * 2480 * t) * 0.5
            + math.sin(TAU * 3120 * t) * 0.32
            + math.sin(TAU * 2480 * 2 * t) * 0.12
        )
        out.append(tone * trill * attack * release * 0.75)
    return out


def match_bed(seconds=42.0):
    """Episode 3 low-energy match underscore (42s, ducked under voice)."""
    notes = [110.0, 130.81, 146.83, 130.81, 98.0, 110.0, 164.81, 146.83]
    step = 1.75
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        idx = int(t / step) % len(notes)
        local = t - int(t / step) * step
        pulse = 0.6 + 0.4 * math.sin(TAU * 1.05 * t) ** 2
        bass = math.sin(TAU * notes[idx] * t) * 0.34
        pad = math.sin(TAU * notes[idx] * 1.5 * local) * math.exp(-local * 0.9) * 0.16
        high = math.sin(TAU * notes[idx] * 4 * t) * 0.035 * pulse
        out.append((bass * pulse + pad + high) * 0.13)
    return out


def triumph_bed(seconds=4.0):
    """Episode 3 triumphant BGM swell into the cliffhanger cut."""
    out = []
    for i in range(int(SR * seconds)):
        t = i / SR
        rise = min(1.0, t / 1.4) ** 1.6
        release = min(1.0, max(0.0, (seconds - t) / 0.7))
        chord = (
            math.sin(TAU * 261.63 * t) * 0.36
            + math.sin(TAU * 329.63 * t) * 0.3
            + math.sin(TAU * 392.0 * t) * 0.26
            + math.sin(TAU * 523.25 * t) * 0.2
        )
        low = math.sin(TAU * 65.41 * t) * 0.4
        shimmer = math.sin(TAU * 1046.5 * t) * 0.08 * rise
        out.append((chord + low + shimmer) * rise * release * 0.4)
    return out


def main():
    write_wav(SFX_DIR / "stamp.wav", stamp())
    write_wav(SFX_DIR / "paper.wav", paper())
    write_wav(SFX_DIR / "door.wav", door())
    write_wav(SFX_DIR / "bell.wav", bell())
    write_wav(BGM_DIR / "tense.wav", tense_bed())
    write_wav(BGM_DIR / "warm.wav", warm_bed())

    # Episode 3 — goal impacts, crowd escalations, referee whistle and beds.
    write_wav(SFX_DIR / "kick.wav", kick())
    write_wav(SFX_DIR / "whoosh.wav", whoosh())
    write_wav(SFX_DIR / "net.wav", net())
    write_wav(SFX_DIR / "crowd-small.wav", crowd(2.2, 0.42, 211))
    write_wav(SFX_DIR / "crowd-medium.wav", crowd(2.8, 0.62, 223))
    write_wav(SFX_DIR / "crowd-big.wav", crowd(3.6, 0.9, 239))
    write_wav(SFX_DIR / "whistle.wav", whistle())
    write_wav(BGM_DIR / "match.wav", match_bed())
    write_wav(BGM_DIR / "triumph.wav", triumph_bed())
    print("Wrote SFX and BGM beds to public/audio/sfx and public/audio/bgm")


if __name__ == "__main__":
    main()
