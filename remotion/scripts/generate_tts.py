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
    ("e2_b1_narrator", "narrator", 0, 150, "RM450,000 tertunggak. 30 hari lagi, stadium Buluh FC dirampas."),
    ("e2_b2_narrator", "narrator", 150, 260, "Hari demi hari, dia kejar penaja besar. Satu demi satu."),
    ("e2_b2_penaja1", "penaja", 260, 375, "Divisyen 5? Maaf, bos. Kami nak logo pada kelab yang orang kenal."),
    ("e2_b2_penaja2", "penaja", 385, 495, "Tak ada bajet. Bila stadium penuh, baru kita borak."),
    ("e2_b2_narrator2", "narrator", 540, 630, "Pintu demi pintu tertutup. Tapi dia tak berhenti."),
    ("e2_b3_narrator", "narrator", 630, 745, "Tapi di hujung jalan, sebuah kedai kek kecil terdengar pasal ni."),
    ("e2_b3_penaja", "penaja", 755, 900, "Kami tak ada duit besar. Tapi kami boleh bawa kek... dan sokongan. Kami percaya pada korang."),
    ("e2_b3_narrator2", "narrator", 970, 1050, "Tak banyak. Tapi buat pertama kali, ada yang percaya."),
    ("e2_b4_narrator", "narrator", 1050, 1140, "Petang itu, di bilik kerja yang sama, satu idea lahir."),
    ("e2_b4_pemilik", "pemilik", 1145, 1255, "Kita buat perlawanan amal. Kumpul duit orang ramai."),
    ("e2_b4_jurulatih", "jurulatih", 1245, 1320, "Kau fikir orang nak datang tengok perlawanan kita?"),
    ("e2_b4_cta", "narrator", 1340, 1500, "Mampukah perlawanan amal ni selamatkan Buluh FC? Komen 'EPISOD 3' kalau nak tengok!"),
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


def normalize(source, destination):
    filt = (
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,"
        "areverse,loudnorm=I=-14:TP=-3:LRA=11"
    )
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(source), "-af", filt,
         "-ar", "44100", "-b:a", "160k", str(destination)],
        check=True,
    )


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
        speed = 1.0

        synthesize(key, text, VOICES[speaker], speed, raw)
        normalize(raw, final)
        length = duration(final)

        for candidate in (1.05, 1.1):
            if length <= budget + 0.15:
                break
            speed = candidate
            synthesize(key, text, VOICES[speaker], speed, raw)
            normalize(raw, final)
            length = duration(final)

        flag = "OK" if length <= budget + 0.15 else "OVER"
        print(f"{name + '.mp3':20} {budget:6.2f}s {length:8.2f}s {speed:5.2f}x {flag}")

    for stale in raw_dir.glob("*.mp3"):
        stale.unlink()
    raw_dir.rmdir()


if __name__ == "__main__":
    main()
