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
    # Season 1 narrator is a separate key so regenerating Ep1–5 TTS stays unchanged.
    "narrator_s1": "voice_6",
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
    # Season 1 (Episode 6-12) — new matchday cast. Existing voices are reused
    # for BOS / JURULATIH / PEGUAM / AZAM; newcomers get distinct voices.
    "farid": "voice_4",
    "danial": "voice_6",
    "zaki": "voice_2",
    "pakdin": "voice_1",
    "rayyan": "voice_4",
    "bob": "voice_5",
    "malik": "voice_3",
    "besikeeper": "voice_2",
    "pengadil": "voice_2",
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
    # Season 1 — the narrator never shares a voice ID with a character, and the
    # three voice_2 speakers are separated by pace/pitch.
    "narrator_s1": {"speed": 0.98, "pitch": 0.92},
    "peguam": {"speed": 0.94, "pitch": 0.88},
    "zaki": {"speed": 1.1, "pitch": 1.08},
    "coach": {"speed": 1.04, "pitch": 1.0},
    "bob": {"speed": 1.12, "pitch": 0.86},
    "azam": {"speed": 1.06, "pitch": 1.06},
}

# Episode 5 onward is generated at natural speed only. No fit-to-budget pass
# and no atempo stretching: the shot timeline is rebuilt from measured clips.
NATURAL_SPEEDS = {
    "bos": 1.0,
    "coach": 1.0,
    "karim": 1.0,
    "teammate1": 1.0,
    "teammate2": 1.0,
    "azam": 1.0,
    "narrator_s1": 1.0,
    "peguam": 1.0,
    "farid": 1.0,
    "danial": 1.0,
    "zaki": 1.0,
    "pakdin": 1.0,
    "rayyan": 1.0,
    "bob": 1.0,
    "malik": 1.0,
    "besikeeper": 1.0,
    "pengadil": 1.0,
}

# Kept as an alias for older callers / documentation.
E5_NATURAL_SPEEDS = NATURAL_SPEEDS

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
    ("e2_s6_jurulatih", "jurulatih", 924, 1056, "Kalau macam tu, kita buat perlawanan amal. Biar satu pekan tahu Buluh FC belum mati."),
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
    # Episode 5 — mirrors episodes/episode-5/audio-script.json (45.3s / 1359 frames).
    # Frames are derived from the natural 1.0x clips; no fitting/stretching is
    # applied. Azam enters directly on e5_11. e5_06's audio starts
    # at frame 494, a 0.47s J-cut into Act 2's visual cut at frame 508, right as
    # the debt counter lands on RM331,500.
    ("e5_01", "bos", 0, 141, "Karim… jangan salah faham. Aku takkan jual kapten aku."),
    ("e5_02", "karim", 149, 209, "Hutang kita dekat empat ratus ribu, bos."),
    ("e5_03", "karim", 221, 315, "Kalau kelab ni mati, semua habis. Jual aku."),
    ("e5_04", "bos", 323, 348, "Kau pasti, Rim?"),
    ("e5_05", "karim", 356, 417, "Bawa Buluh FC naik Divisyen 1."),
    ("e5_06", "teammate1", 494, 593, "Weh, dengar cerita bos dah sign pemain nombor 7 baru!"),
    ("e5_07", "teammate2", 601, 724, "Fuhh, baru jual Karim lima puluh ribu… confirm striker padu ni!"),
    ("e5_08", "coach", 732, 765, "Siapa kau beli ni, bos?"),
    ("e5_09", "bos", 773, 792, "Tengok sendiri."),
    ("e5_11", "azam", 836, 914, "Assalamualaikum. Saya Azam. Defender baru."),
    ("e5_12", "teammate1", 922, 988, "Kejap… defender pakai nombor tujuh?!"),
    ("e5_13", "azam", 996, 1022, "Baru lawan gerun."),
    ("e5_14", "coach", 1034, 1142, "Bos… kita baru dapat lima puluh ribu. Berapa gaji budak ni?"),
    ("e5_15", "bos", 1154, 1175, "Lima ringgit."),
    ("e5_16", "coach", 1178, 1195, "Lima ribu?!"),
    ("e5_17", "bos", 1198, 1279, "Lima ringgit. Duit Karim semua bayar hutang."),
    # Season 1 — Episodes 6-12 mirror their audio-script.json line budgets.
    # Frames are locked to the JSON; the standard fitting path trims/fits each
    # clip to those budgets so timed subtitles stay aligned.
    # Episode 6 — Janji Bank & Matchday 1 (1290f / 43s).
    ("e6_01", "narrator", 0, 75, "Cop merah. Meja ni bukan lagi milik kita."),
    ("e6_02", "peguam", 90, 210, "Masa awak habis, bos. Stadium ni milik bank."),
    ("e6_03", "bos", 225, 345, "Kasih satu musim. Juara Divisyen 5 — hadiah dengan bonus penaja lunas hutang kita."),
    ("e6_04", "peguam", 360, 414, "Juara atau sita. Kalah, kosong ringgit."),
    ("e6_05", "narrator", 435, 555, "Matchday satu. Tanpa Karim, Buluh FC macam tak ada nakhoda."),
    ("e6_06", "zaki", 570, 675, "Kau tak ada kapten? Bagus la. Kami nombor satu."),
    ("e6_07", "coach", 690, 765, "Azam! Tekan! Jangan bagi dia ruang!"),
    ("e6_08", "narrator", 780, 870, "Dua gol. Satu lawan. Dan lampu sorot bank masih menyala."),
    ("e6_09", "narrator", 915, 1005, "Minit ke-89. Azam nampak satu peluang terakhir untuk menahan."),
    ("e6_10", "azam", 1020, 1080, "Tak lepas. Hari ini tak lepas."),
    ("e6_11", "narrator", 1095, 1200, "Di tepi padang, Peguam tengok jam. Dia tak perlu cakap apa-apa."),
    # Episode 7 — Menang Pertama (1260f / 42s).
    ("e7_01", "narrator", 0, 75, "Otai Kampung FC. Lambat jalan, tapi mulut lebih laju dari kaki."),
    ("e7_02", "pakdin", 90, 195, "Gaji lima ringgit? Anak muda, aku boleh bayar seminggu dengan duit poket."),
    ("e7_03", "azam", 210, 270, "Boleh la. Tarikh gaji nanti saya panjang tangan sikit."),
    ("e7_04", "narrator", 285, 435, "Dia jalan perlahan. Tapi matanya baca padang macam main catur."),
    ("e7_05", "coach", 465, 555, "Tinggi! Press dari depan! Jangan tunggu dia bagi pass!"),
    ("e7_06", "narrator", 570, 660, "Pak Din bagi pass kecil — Azam baca, dan potong."),
    ("e7_07", "azam", 675, 720, "Farid! Pergi!"),
    ("e7_08", "narrator", 735, 825, "Satu sentuhan. Satu sorakan. Gol pertama Buluh FC musim ni!"),
    ("e7_09", "farid", 840, 890, "Akhirnya!"),
    ("e7_10", "narrator", 915, 990, "Whistle panjang. KEK MAJU berdiri depan, papan iklan dia nampak lebih terang."),
    ("e7_11", "bos", 1005, 1080, "Lima belas ribu masuk. Tiket, bukan duit syiling."),
    ("e7_12", "narrator", 1095, 1170, "Hutang turun. Tiga ratus tiga puluh satu ke tiga ratus enam belas."),
    # Episode 8 — Duit vs Maruah (1320f / 44s).
    ("e8_01", "narrator", 0, 75, "Vanguard Elite. Kasut emas, kereta mewah, dan satu sampul tebal."),
    ("e8_02", "rayyan", 90, 210, "Kelab kau hutang, kan? Ambil la ini. Kalah je hari ni."),
    ("e8_03", "bos", 225, 330, "Kau fikir kami jual maruah sekali dengan hutang?"),
    ("e8_04", "narrator", 345, 465, "Bos letak sampul tu balik ke tangan Rayyan. Tenang je."),
    ("e8_05", "narrator", 495, 570, "Rayyan main cantik. Skill, feint, nampak macam iklan."),
    ("e8_06", "rayyan", 585, 675, "Nampak tak? Ini kelas divisyen empat."),
    ("e8_07", "azam", 690, 750, "Kelas? Saya jaga kelas, bro."),
    ("e8_08", "narrator", 765, 855, "Azam tutup ruang. Farid lari. Dua satu."),
    ("e8_09", "farid", 870, 945, "Maruah tak dijual, tapi gol dijual!"),
    ("e8_10", "narrator", 975, 1050, "Papan kedudukan: Buluh FC kekal tempat ketiga. Dua menang berturut-turut."),
    ("e8_11", "bos", 1065, 1140, "Tiga ratus ribu... tak. Dua ratus sembilan puluh enam."),
    ("e8_12", "narrator", 1155, 1230, "RM296,500. Kali pertama kita nampak garisan tiga ratus."),
    # Episode 9 — Hutang Naik Balik (1230f / 41s).
    ("e9_01", "narrator", 0, 75, "Malamnya. Satu letupan, dan stadium gelap terus."),
    ("e9_02", "coach", 90, 225, "Tiang lampu meletup. Inspector kata padang kena tutup sampai bayar."),
    ("e9_03", "narrator", 240, 405, "Dua puluh lima ribu. Sebelum Matchday empat. Atau forfeit."),
    ("e9_04", "narrator", 435, 510, "Bos angkat telefon. Satu nama yang dia harap tak perlu jumpa lagi."),
    ("e9_05", "bos", 525, 675, "Satu top-up lagi. Aku tak ada pilihan."),
    ("e9_06", "peguam", 690, 855, "Satu langkah depan, dua langkah belakang, bos."),
    ("e9_07", "narrator", 870, 915, "Dia senyum. Macam dah lama tunggu hari ini."),
    ("e9_08", "narrator", 945, 1035, "Tiga ratus dua puluh satu ribu. Lampu balik menyala, hutang pun balik naik."),
    ("e9_09", "bos", 1050, 1140, "Armband Karim masih kat meja. Still tak ada kapten."),
    # Episode 10 — Hidup Mati (1290f / 43s).
    ("e10_01", "narrator", 0, 75, "Kilat Rovers. Serangan gila, pertahanan kosong."),
    ("e10_02", "bob", 90, 195, "Kami tak percaya pada pertahanan! Kami percaya pada gol!"),
    ("e10_03", "narrator", 210, 405, "Danial penat menjerit pada backline. Skor: tiga-tiga."),
    ("e10_04", "coach", 435, 525, "Semua naik! Sekarang!"),
    ("e10_05", "narrator", 540, 615, "Minit ke-88. Azam blok, then hantar ke Farid."),
    ("e10_06", "azam", 630, 690, "Sekali lagi, Farid!"),
    ("e10_06b", "bob", 705, 765, "Kau blok, aku serang! Terus, Azam!"),
    ("e10_07", "narrator", 780, 855, "Satu tendangan. Empat tiga. Buluh FC masih hidup!"),
    ("e10_08", "farid", 870, 920, "Sampai juga!"),
    ("e10_09", "narrator", 945, 1035, "Tempat kedua. Tiga mata di belakang Besi Waja."),
    ("e10_10", "bos", 1050, 1125, "Tiga ratus ribu tepat. Juara nanti, hadiah dengan bonus penaja lunas semua."),
    ("e10_11", "narrator", 1140, 1200, "Matchday lima. Besi Waja. Juara atau sita."),
    # Episode 11 — Separuh Masa Neraka (1320f / 44s).
    ("e11_01", "narrator", 0, 75, "Besi Waja. Tak kalah. Senyap. Dan mereka datang nak tanam kita."),
    ("e11_02", "pengadil", 90, 165, "Kad kuning. Amaran terakhir."),
    ("e11_03", "malik", 180, 255, "Kau tak boleh lari."),
    ("e11_04", "narrator", 270, 465, "Nol dua di separuh masa. Denda kad dan caj bank: lima ribu. Hutang naik."),
    ("e11_05", "narrator", 495, 570, "Bilik ganti sunyi. Semua kepala down. Baju basah, lampu berkelip."),
    ("e11_06", "farid", 585, 720, "Kita tak boleh lawan diorang tanpa Karim. Serius."),
    ("e11_07", "azam", 735, 825, "Dia dah pergi. Kita masih kena berdiri."),
    ("e11_08", "narrator", 840, 945, "Pintu terbuka. Bos masuk, tak cakap apa-apa lagi."),
    ("e11_09", "bos", 975, 1110, "Karim dah pergi. Hari ni, kau kapten Buluh FC."),
    ("e11_10", "narrator", 1125, 1230, "Armband emas itu keluar dari poket. Azam tak tunduk."),
    # Episode 12 — Juara Divisyen 5 (1350f / 45s).
    ("e12_01", "narrator", 0, 75, "Dia ketatkan armband. Terus tunjuk depan."),
    ("e12_02", "azam", 90, 180, "Aku kapten sekarang. Ikut aku."),
    ("e12_03", "narrator", 195, 285, "Azam atur pertahanan, kita balas dua gol. Setarakan!"),
    ("e12_04", "farid", 300, 435, "Kasih saya satu lagi. Satu je."),
    ("e12_05", "narrator", 465, 540, "Minit ke-90. Dua dua. Satu lawan satu."),
    ("e12_06", "azam", 555, 630, "Farid! Sekarang!"),
    ("e12_07", "narrator", 645, 765, "Slow motion. Tendangan ke penjuru atas. Tiga dua!"),
    ("e12_08", "farid", 780, 870, "MASUK!"),
    ("e12_09", "narrator", 915, 1005, "Peguam tengok telefon. Hadiah juara dan bonus Nexus Sports masuk."),
    ("e12_10", "bos", 1020, 1110, "Tiga ratus lima ribu... kosong. Kita lunas."),
    ("e12_11", "narrator", 1125, 1215, "Telefon Bos berdering. Divisyen 4. Lawan pertama: kelab Karim."),
    ("e12_12", "azam", 1230, 1265, "Kita akan jumpa dia. Di Divisyen 4."),
]


S1_PREFIXES = {f"e{n}" for n in range(6, 13)}
NATURAL_PREFIXES = {"e5"} | S1_PREFIXES


def voice_profile(name, speaker):
    """Season 1 uses a dedicated narrator voice so Ep1–5 TTS is unchanged."""
    if name.split("_", 1)[0] in S1_PREFIXES and speaker == "narrator":
        return "narrator_s1"
    return speaker


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
    """Trim silence from BOTH ends; the first clip then lands exactly at t=0.0s."""
    temp = path.with_suffix(".leadtrim.mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(path),
         "-af", "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,"
                "areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,areverse",
         "-ar", "44100", "-b:a", "160k", str(temp)],
        check=True,
    )
    temp.replace(path)


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
        voice_id = voice_profile(name, speaker)
        style = VOICE_STYLE.get(voice_id, {})
        base_speed = style.get("speed", 1.0)
        pitch = style.get("pitch", 1.0)
        speed = base_speed

        if name.split("_", 1)[0] in NATURAL_PREFIXES:
            # Natural-speed path for Ep5–12: no fitting, no atempo stretching.
            speed = NATURAL_SPEEDS[voice_id]
            synthesize(key, text, VOICES[voice_id], speed, raw)
            normalize(raw, final, pitch)
            strip_leading_silence(final)
            length = duration(final)
            flag = "NATURAL"
            print(f"{name + '.mp3':20} {'n/a':>7} {length:8.2f}s {speed:5.2f}x {flag}")
            continue

        synthesize(key, text, VOICES[voice_id], speed, raw)
        normalize(raw, final, pitch)
        length = duration(final)

        for candidate in (base_speed * 1.05, base_speed * 1.1):
            if length <= budget + 0.15:
                break
            speed = min(candidate, 1.2)
            synthesize(key, text, VOICES[voice_id], speed, raw)
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

        if name == "e3_01" or name.startswith("e4_"):
            strip_leading_silence(final)
            length = duration(final)

        flag = "OK" if length <= budget + 0.15 else "OVER"
        print(f"{name + '.mp3':20} {budget:6.2f}s {length:8.2f}s {speed:5.2f}x {flag}")

    for stale in raw_dir.glob("*.mp3"):
        stale.unlink()
    raw_dir.rmdir()


if __name__ == "__main__":
    main()
