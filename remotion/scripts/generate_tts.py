import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
PROJECT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env"
OUT_DIR = PROJECT / "public" / "audio" / "tts"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
API = "https://api.ilmu.ai/v1/audio/speech"
FPS = 30

VOICES = {
    "narrator": "voice_5",
    "peguam": "voice_2",
    "pemilik": "voice_3",
    "jurulatih": "voice_2",
    "pengerusi": "voice_5",
    "penaja": "voice_4",
    "kekmaju": "voice_1",
    "penaja1": "voice_2",
    "penaja2": "voice_5",
    # Episode 3 — distinct voices for the match cast.
    "rizal": "voice_3",
    "kapten": "voice_2",
    "peminat": "voice_4",
    # Episode 4 — Boss and Coach reuse the established Owner/Jurulatih voices;
    # Karim gets a distinct, grounded lower-pitched male voice.
    "bos": "voice_3",
    "coach": "voice_2",
    "karim": "voice_4",
    # Episode 5 — Azam is a bright, fast young defender; teammates get two
    # other distinct voices so the locker-room rumour has real separation.
    "azam": "voice_5",
    "teammate1": "voice_4",
    "teammate2": "voice_1",
}

VOICE_STYLE = {
    "penaja1": {"speed": 1.04, "pitch": 1.0},
    "penaja2": {"speed": 0.96, "pitch": 0.94},
    "rizal": {"speed": 1.06, "pitch": 1.06},
    "kapten": {"speed": 0.97, "pitch": 0.94},
    "peminat": {"speed": 1.03, "pitch": 1.02},
    "bos": {"speed": 0.99, "pitch": 0.97},
    "coach": {"speed": 1.04, "pitch": 1.0},
    "karim": {"speed": 0.95, "pitch": 0.9},
    "azam": {"speed": 1.06, "pitch": 1.06},
    "teammate1": {"speed": 1.06, "pitch": 1.05},
    "teammate2": {"speed": 1.08, "pitch": 1.05},
}

MANIFEST = [
    ("b1_narrator", "narrator", 0, 196, "Malam ni, dalam bilik kerja yang sejuk, satu folder merah kena ketuk atas meja. Nampak macam biasa... tapi ada yang nak berakhir."),
    ("b1_peguam", "peguam", 196, 340, "RM450,000 tertunggak. Tiga puluh hari. Atau stadium ini milik kami."),
    ("b2_narrator", "narrator", 340, 580, "Padang dah gelap, tapi lampu stadium masih terang. Buluh FC... kelab yang dulu pernah ada harapan."),
    ("b3_narrator", "narrator", 580, 749, "Dia jalan dari gelap ke terang. Sepuluh tahun duit simpanan, orang kata ni kerja gila... tapi dia tak peduli."),
    ("b3_pemilik", "pemilik", 749, 820, "Tapi ni rumah saya."),
    ("b4_narrator", "narrator", 820, 942, "Bilik ganti sunyi, lampu berkelip. Dia masuk, dan terus rasa tekanan tu."),
    ("b4_pemilik", "pemilik", 945, 1030, "Saya tahu ni berat. Tapi semuanya berubah hari ini."),
    ("b4_jurulatih", "jurulatih", 1033, 1187, "Maaf bos, tapi kata-kata tak bagi pampasan untuk bayar bil elektrik. Atau gaji pemain."),
    ("b5_narrator", "narrator", 1220, 1375, "Meja kayu, lampu meja, sepasang kunci. Pengerusi tak banyak cakap — tapi dia tahu beban yang dia serahkan."),
    ("b5_pengerusi", "pengerusi", 1378, 1475, "Sekarang ni masalah awak, anak muda. Jangan sampai tenggelam."),
    ("b5_pemilik", "pemilik", 1478, 1569, "Saya akan cuba bina semula kelab ni. Apa pun jadinya."),
    ("b6_narrator", "narrator", 1610, 1762, "Bilik dah gelap. Satu dokumen dengan cop merah muncul — klausul yang tersorok daripada dia sejak awal."),
    ("b6_pemilik", "pemilik", 1765, 1832, "Wang simpanan saya hanya beli hutangnya."),
    ("b7_narrator", "narrator", 1910, 2035, "Bilik kerja yang sama. Folder ditutup perlahan. Satu perkiraan dah bermula."),
    ("b7_peguam", "peguam", 2038, 2119, "Tiga puluh hari. Hari pertama bermula sekarang."),
    # Episode 2 — mirrors episodes/episode-2/audio-script.json (42s / 1260 frames).
    ("e2_s1_narrator", "narrator", 15, 120, "Hutang empat ratus lima puluh ribu ringgit. Masa makin suntuk."),
    ("e2_s2_narrator", "narrator", 135, 225, "Satu demi satu penaja besar dia ketuk... tapi semua tutup pintu."),
    ("e2_s2_penaja1", "penaja1", 234, 324, "Divisyen lima? Maaf lah bro, memang tak berbaloi."),
    ("e2_s3_penaja2", "penaja2", 336, 435, "Kalau kelab besar, boleh la cerita. Ini risiko tinggi sangat."),
    ("e2_s4_narrator", "narrator", 450, 534, "Semua pintu tertutup. Tinggal harapan kosong je."),
    ("e2_s5_narrator", "narrator", 555, 654, "Sampai la dia singgah kat satu kedai kek kecil ni... Kek Maju."),
    ("e2_s5_kekmaju", "kekmaju", 666, 804, "Akak bukan orang kaya, tapi akak sayang kelab kita ni. Ambik la sikit ni, buat modal dulu."),
    ("e2_s5_pemilik", "pemilik", 816, 906, "Terima kasih banyak, kak. Kami memang takkan lupa jasa akak."),
    ("e2_s6_jurulatih", "jurulatih", 924, 1056, "Kalau macam tu, kita buat perlawanan amal. Biar satu pekan tahu Buloh FC belum mati."),
    ("e2_s6_pemilik", "pemilik", 1068, 1176, "Betul. Ini peluang terakhir kita. Kalau kalah, semua habis."),
    # Episode 3 — mirrors episodes/episode-3/audio-script.json (42s / 1260 frames).
    ("e3_01", "narrator", 0, 78, "Gol! Sekali tendang, Buluh FC dah buka skor."),
    ("e3_s2_narrator", "narrator", 96, 192, "Hulubalang United favourite... tapi Buluh FC main lain macam hari ni."),
    ("e3_s2_rizal", "rizal", 210, 282, "Satu-dua, terus tembus! Kita tak main-main!"),
    ("e3_s2_narrator2", "narrator", 300, 351, "Dua gol. Stadium mula percaya."),
    ("e3_s3_narrator", "narrator", 369, 438, "Gol ketiga. Satu banger dari luar kotak."),
    ("e3_s3_rizal", "rizal", 456, 528, "Bro! Tendangan tu macam rocket!"),
    ("e3_s3_narrator2", "narrator", 546, 624, "Tiga-nol. Hulubalang terpaku."),
    ("e3_s3_kapten", "kapten", 642, 726, "Kita boleh lawan sesiapa. Serius."),
    ("e3_s4_peminat", "peminat", 762, 858, "Lain macam... musim ni Buluh FC memang serius!"),
    ("e3_s4_narrator", "narrator", 876, 954, "Dari kedai kek sampai ke tepi padang. Akak pun percaya."),
    ("e3_s4_peminat2", "peminat", 966, 1011, "Kita tak kalah lagi!"),
    ("e3_s5_kapten", "kapten", 1035, 1146, "Pemanas badan dah habis. Musim baru bermula."),
    # Episode 4 — mirrors episodes/episode-4/audio-script.json (51s / 1530 frames).
    # A deliberate 39-frame (1.3s) silence sits between e4_09 (ends 1335) and e4_10 (starts 1374).
    ("e4_01", "bos", 0, 125, "Kelab Divisyen Empat baru hantar tawaran. Lima puluh ribu untuk Karim."),
    ("e4_02", "coach", 141, 251, "Kau biar betul? Musim baru nak mula, kau nak jual kapten kita?"),
    ("e4_03", "coach", 273, 435, "Karim baru dua puluh lapan. Friendly lepas dia MVP! Semua serangan kita jalan sebab dia kat tengah."),
    ("e4_04", "bos", 456, 535, "Aku tahu, coach. Aku pun tengok game tu."),
    ("e4_05", "bos", 549, 719, "Tapi tengok akaun kelab ni. Lima puluh ribu memang tak banyak, tapi cukup untuk kita bernafas."),
    ("e4_06", "bos", 729, 897, "Lagi satu... gaji Karim paling tinggi dalam skuad. Kalau dia keluar, kos gaji kita terus turun."),
    ("e4_07", "coach", 909, 1038, "Kalau dia keluar, siapa nak kawal padang? Kita nak menang ke nak cukup syarat je?"),
    ("e4_08", "bos", 1062, 1241, "Tak ada guna menang satu game kalau bulan depan kelab ni dah tak mampu bayar gaji budak-budak lain."),
    ("e4_09", "bos", 1251, 1335, "Keputusan aku muktamad. Kita terima tawaran tu."),
    ("e4_10", "karim", 1374, 1433, "Bos... betul ke apa yang aku dengar tadi?"),
    # Episode 5 — mirrors episodes/episode-5/audio-script.json (72s / 2160 frames).
    # e5_06's audio starts at frame 825 and is a deliberate 0.5s J-cut into
    # Act 2's visual cut at frame 840; its subtitle waits for the new shot.
    ("e5_01", "bos", 0, 123, "Karim… jangan salah faham. Aku takkan jual kapten aku."),
    ("e5_02", "karim", 132, 234, "Hutang kita dekat empat ratus ribu, bos."),
    ("e5_03", "karim", 243, 363, "Kalau kelab ni mati, semua habis. Jual aku."),
    ("e5_04", "bos", 375, 429, "Kau pasti, Rim?"),
    ("e5_05", "karim", 441, 585, "Bawa Buluh FC naik Divisyen 1."),
    ("e5_06", "teammate1", 825, 940, "Weh, dengar cerita bos dah sign pemain nombor 7 baru!"),
    ("e5_07", "teammate2", 951, 1071, "Fuhh, baru jual Karim lima puluh ribu… confirm striker padu ni!"),
    ("e5_08", "coach", 1083, 1179, "Siapa kau beli ni, bos?"),
    ("e5_09", "bos", 1191, 1287, "Tengok sendiri."),
    ("e5_10", "azam", 1335, 1383, "PERTAMA!"),
    ("e5_11", "azam", 1398, 1494, "Assalamualaikum. Saya Azam. Defender baru."),
    ("e5_12", "teammate1", 1509, 1605, "Kejap… defender pakai nombor tujuh?!"),
    ("e5_13", "azam", 1620, 1674, "Baru lawan gerun."),
    ("e5_14", "coach", 1695, 1827, "Bos… kita baru dapat lima puluh ribu. Berapa gaji budak ni?"),
    ("e5_15", "bos", 1845, 1896, "Lima ringgit."),
    ("e5_16", "coach", 1914, 1971, "Lima ribu?!"),
    ("e5_17", "bos", 1992, 2118, "Lima ringgit. Duit Karim semua bayar hutang."),
]


def load_key():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("ILMU_API_KEY="):
            return line.split("=", 1)[1].strip().strip("\"'")
    raise SystemExit("ILMU_API_KEY missing from repo-root .env")


def synthesize(key, text, voice, speed, destination):
    payload = json.dumps(
        {
            "model": "ilmu-tts-v2.1",
            "input": text,
            "voice": voice,
            "language": "ms",
            "speed": speed,
            "response_format": "mp3",
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        API,
        data=payload,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        destination.write_bytes(response.read())


def normalize(source, destination, pitch=1.0):
    filt = (
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,"
        "areverse"
    )
    if pitch != 1.0:
        rate = int(round(44100 * pitch))
        filt += f",asetrate={rate},aresample=44100,atempo={44100 / rate:.6f}"
    filt += ",loudnorm=I=-14:TP=-3:LRA=11"
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(source), "-af", filt,
         "-ar", "44100", "-b:a", "160k", str(destination)],
        check=True,
    )


def strip_leading_silence(path):
    """Force the first clip to start exactly at t=0.0s (pattern-interrupt hook)."""
    temp = path.with_suffix(".leadtrim.mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(path),
         "-af", "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,"
                "areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,areverse",
         "-ar", "44100", "-b:a", "160k", str(temp)],
        check=True,
    )
    temp.replace(path)


def stretch_to_budget(path, budget):
    """Gently lengthen short punchy clips so Episode 5's cinematic beats stay audio-driven.

    atempo preserves pitch; the 1.3x cap keeps voices natural. Any remainder is
    left as an intentional, SFX/BGM-filled beat rather than forced silence.
    """
    length = duration(path)
    if length >= budget - 0.08:
        return length
    factor = min(budget / length, 1.3)
    if factor <= 1.01:
        return length
    stretched = path.with_suffix('.stretch.mp3')
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(path),
         "-filter:a", f"atempo={1.0 / factor:.4f}", "-ar", "44100", "-b:a", "160k", str(stretched)],
        check=True,
    )
    stretched.replace(path)
    return duration(path)


def duration(path):
    result = subprocess.run(
        [FFMPEG, "-i", str(path), "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    match = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", result.stderr)
    if not match:
        return 0.0
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def main():
    key = load_key()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_dir = OUT_DIR / "_raw"
    raw_dir.mkdir(exist_ok=True)

    prefix = sys.argv[1] if len(sys.argv) > 1 else ""
    entries = [row for row in MANIFEST if row[0].startswith(prefix)]
    if not entries:
        raise SystemExit(f"No TTS entries match prefix {prefix!r}")

    print(f"{'file':20} {'budget':>7} {'duration':>9} {'speed':>6}")
    for name, speaker, start, end, text in entries:
        budget = (end - start) / FPS
        raw = raw_dir / f"{name}.mp3"
        final = OUT_DIR / f"{name}.mp3"
        style = VOICE_STYLE.get(speaker, {})
        base_speed = style.get("speed", 1.0)
        pitch = style.get("pitch", 1.0)
        speed = base_speed

        synthesize(key, text, VOICES[speaker], speed, raw)
        normalize(raw, final, pitch)
        length = duration(final)

        for candidate in (base_speed * 1.05, base_speed * 1.1):
            if length <= budget + 0.15:
                break
            speed = min(candidate, 1.2)
            synthesize(key, text, VOICES[speaker], speed, raw)
            normalize(raw, final, pitch)
            length = duration(final)

        if length > budget + 0.15:
            tempo = min(length / budget, 1.9)
            fitted = raw_dir / f"{name}_fit.mp3"
            subprocess.run(
                [FFMPEG, "-y", "-loglevel", "error", "-i", str(final),
                 "-filter:a", f"atempo={tempo:.4f}", "-ar", "44100", "-b:a", "160k", str(fitted)],
                check=True,
            )
            fitted.replace(final)
            length = duration(final)
            speed = round(speed * tempo, 2)

        if name == "e3_01" or name.startswith("e4_") or name.startswith("e5_"):
            strip_leading_silence(final)
            length = duration(final)

        if name.startswith("e5_"):
            length = stretch_to_budget(final, budget)

        flag = "OK" if length <= budget + 0.15 else "OVER"
        print(f"{name + '.mp3':20} {budget:6.2f}s {length:8.2f}s {speed:5.2f}x {flag}")

    for stale in raw_dir.glob("*.mp3"):
        stale.unlink()
    raw_dir.rmdir()


if __name__ == "__main__":
    main()
