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
    "narrator_s1": "voice_1",
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
    "danial": "voice_5",
    "zaki": "voice_2",
    "pakdin": "voice_2",
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
    "pakdin": {"speed": 0.88, "pitch": 0.82},
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
    ("e6_01", "narrator", 0, 93, "Cop merah. Meja ni bukan lagi milik kita."),
    ("e6_02", "peguam", 93, 201, "Tujuh hari, bos. Juara atau sita. Awak yang sign."),
    ("e6_03", "bos", 201, 309, "Kasih satu musim. Juara Divisyen 5, hutang lunas."),
    ("e6_04", "bos", 309, 423, "Armband Karim kekal atas meja ni. Sampai kita juara."),
    ("e6_05", "peguam", 423, 516, "Armband tak bayar hutang. Gol yang bayar."),
    ("e6_06", "narrator", 524, 617, "Matchday satu. Tanpa kapten, tanpa Karim."),
    ("e6_07", "zaki", 617, 725, "Tak ada kapten? Aku ada clipboard. Itu beza kita."),
    ("e6_08", "azam", 725, 820, "Hutang bukan mati, bro. Aku jaga belakang."),
    ("e6_09", "danial", 820, 907, "Belakang!! Siapa jaga lurus belakang?!"),
    ("e6_10", "coach", 907, 990, "Fokus! Susun balik! Belum mati lagi!"),
    ("e6_11", "narrator", 998, 1073, "Minit ke-89. Zaki nak satu lagi."),
    ("e6_13", "azam", 1073, 1144, "Tak lepas. Hari ini tak lepas."),
    ("e6_14", "narrator", 1144, 1231, "Peguam catat semua. Tanpa sepatah pun."),
    ("e7_01", "narrator", 0, 93, "Otai Kampung FC. Kaki lambat, mulut laju."),
    ("e7_02", "pakdin", 95, 205, "Gaji lima ringgit? Kasut aku pun lebih mahal, bro."),
    ("e7_03", "azam", 207, 311, "Gaji aku lima ringgit. Blok aku free. Nak rasa?"),
    ("e7_04", "pakdin", 313, 406, "Otai tak panas. Otai tunggu korang silap."),
    ("e7_06", "coach", 414, 487, "Tinggi! Press! Paksa dia silap!"),
    ("e7_07", "narrator", 489, 603, "Pak Din pass biasa. Azam dah baca lima langkah awal."),
    ("e7_08", "azam", 605, 642, "Farid! Bola!"),
    ("e7_09", "narrator", 644, 727, "Satu sentuhan... terus penjuru atas."),
    ("e7_10", "farid", 729, 802, "AKHIRNYA! Gol pertama musim ni!"),
    ("e7_12", "narrator", 810, 918, "Whistle panjang. Gerbang penuh. Kek Maju menyala."),
    ("e7_13", "bos", 920, 1028, "Duit tiket ni... orang datang sebab percaya kita."),
    ("e7_14", "coach", 1030, 1111, "Bos, Azam tanya bila gaji dia naik."),
    ("e7_15", "bos", 1113, 1204, "Dia kata — lepas juara, baru ambil duit."),
    ("e8_01", "narrator", 0, 114, "Vanguard Elite. Kasut emas... dan satu sampul tebal."),
    ("e8_02", "rayyan", 116, 224, "Kelab kau hutang kan? Ambil ni. Kalah je hari ni."),
    ("e8_03", "bos", 226, 332, "Kau fikir kami jual maruah sekali dengan hutang?"),
    ("e8_05", "bos", 334, 454, "Kalau karam, kami karam berdiri. Ni aku simpan — bukti."),
    ("e8_06", "narrator", 462, 543, "Rayyan main cantik. Macam iklan TV."),
    ("e8_07", "rayyan", 545, 649, "Nampak beza kelas? Bukan padang kampung, budak."),
    ("e8_09", "azam", 651, 719, "Kelas? Saya jaga kelas, bro."),
    ("e8_10", "azam", 721, 765, "Farid! Sekarang!"),
    ("e8_12", "narrator", 767, 856, "Counter terakhir. Farid, sekali lagi..."),
    ("e8_13", "farid", 858, 937, "MARUAH TAK DIJUAL — GOL JE DIJUAL!"),
    ("e8_14", "narrator", 945, 1044, "Dua menang berturut. Buluh FC mula memanjat."),
    ("e8_15", "coach", 1046, 1125, "Yang ni menang dengan maruah, bos."),
    ("e8_16", "bos", 1127, 1245, "Sampul tu dalam laci aku. Bukti kita tak jual apa-apa."),
    ("e9_01", "narrator", 0, 95, "Sepuluh malam latihan extra. Lampu terang."),
    ("e9_02", "azam", 97, 188, "Lagi sekali! Blok, halau, langkah balik!"),
    ("e9_03", "danial", 190, 252, "Eh?! Lampu! LAMPU PADAM!!"),
    ("e9_04", "coach", 254, 353, "Tiang letup. Padang tutup sampai kita bayar."),
    ("e9_05", "narrator", 355, 434, "Dua puluh lima ribu. Atau forfeit."),
    ("e9_07", "bos", 442, 546, "Peguam. Lampu kelab aku mati. Top-up satu lagi."),
    ("e9_08", "peguam", 548, 650, "Satu langkah depan, dua langkah belakang, bos."),
    ("e9_09", "peguam", 652, 776, "Tapi budak-budak kau latihan malam. Duit aku hantar esok."),
    ("e9_11", "narrator", 784, 884, "Dua hari lepas. Lampu balik. Hutang pun naik."),
    ("e9_12", "azam", 886, 946, "Lampu ni mahal kan, bos?"),
    ("e9_13", "bos", 948, 1054, "Mahal. Tapi sebab korang nak belajar, aku bayar."),
    ("e9_14", "azam", 1056, 1151, "Lampu ni kita bayar balik... dengan trofi."),
    ("e9_15", "narrator", 1153, 1244, "RM321,500. Tapi kelab ni tak mudah mati."),
    ("e10_01", "narrator", 0, 100, "Kilat Rovers. Serang gila. Pertahanan? Tiada."),
    ("e10_02", "bob", 102, 201, "Pertahanan buat apa?! Gol lagi best, brader!"),
    ("e10_03", "danial", 203, 284, "TIGA TIGA?! Aku penat jerit, Azam!!"),
    ("e10_04", "azam", 286, 381, "Semua dengar aku! Satu blok — kita menang!"),
    ("e10_05", "coach", 389, 495, "Semua naik! Minit 88 — sekarang atau takda esok!"),
    ("e10_06", "narrator", 497, 594, "Kilat serang lagi. Azam baca... dan potong."),
    ("e10_07", "azam", 596, 635, "Farid! Jalan!"),
    ("e10_08", "farid", 637, 691, "Kau blok, aku settle!"),
    ("e10_09", "narrator", 693, 770, "Empat tiga. Buluh FC masih hidup!"),
    ("e10_11", "azam", 772, 851, "Lima ringgit. Lepas ni jadi mahal."),
    ("e10_12", "narrator", 859, 961, "Tempat kedua. Tiga mata di belakang Besi Waja."),
    ("e10_13", "coach", 963, 1048, "Diorang tak senyum. Main macam mesin."),
    ("e10_14", "bos", 1050, 1133, "Mesin boleh rosak. Kita ada jantung."),
    ("e10_15", "narrator", 1135, 1243, "RM300,000 tepat. Matchday lima — juara atau sita."),
    ("e11_01", "narrator", 0, 116, "Besi Waja. Tak kalah satu pun. Datang nak tanam kita."),
    ("e11_02", "malik", 118, 170, "Tekan. Halau. Ulang."),
    ("e11_03", "pengadil", 172, 218, "Kad kuning! Azam!"),
    ("e11_04", "azam", 220, 315, "Hampir lima ribu sebab kad aku. Maaf, bos."),
    ("e11_06", "narrator", 323, 425, "Bilik ganti sunyi. Baju basah. Lampu berkelip."),
    ("e11_07", "farid", 427, 520, "Kita tak boleh lawan diorang tanpa Karim."),
    ("e11_09", "azam", 522, 615, "Karim dah pergi. Kita masih kena berdiri."),
    ("e11_10", "narrator", 617, 688, "Pintu buka. Bos masuk. Senyap."),
    ("e11_11", "bos", 696, 804, "Karim tinggal armband ni. Aku tunggu siapa layak."),
    ("e11_12", "bos", 806, 885, "Azam. Hari ni kau kapten Buluh FC."),
    ("e11_13", "azam", 887, 987, "Kad kuning aku tadi hampir tenggelamkan kita."),
    ("e11_14", "bos", 989, 1105, "Sebab tu aku pilih kau. Yang rasa berat takkan silap."),
    ("e11_15", "azam", 1107, 1221, "Gaji aku lima ringgit. Baju ni aku jaga sampai mati."),
    ("e12_01", "azam", 0, 100, "Diorang tanam kita. Sekarang kita gali balik!"),
    ("e12_04", "narrator", 100, 187, "Corner. Semua naik... termasuk kapten."),
    ("e12_05", "azam", 187, 284, "SETARAF! Sekarang diorang yang tengok kita!"),
    ("e12_07", "narrator", 292, 392, "Minit ke-90. Dua dua. Satu serangan terakhir."),
    ("e12_08", "azam", 392, 436, "FARID! SEKARANG!"),
    ("e12_09", "narrator", 436, 525, "Stadium diam. Satu peluang. Satu nafas."),
    ("e12_10", "farid", 525, 561, "MASUK!!"),
    ("e12_11", "azam", 561, 617, "JUARA!!! KITA JUARA!!!"),
    ("e12_12", "malik", 617, 692, "Kita kalah... pada kelab hutang."),
    ("e12_13", "narrator", 700, 797, "Kat tribun... satu siluet dah lama berdiri."),
    ("e12_14", "bos", 797, 839, "Rim...? KARIM?!"),
    ("e12_15", "karim", 839, 945, "Aku kata dulu — jangan jual kapten. Lagi garang!"),
    ("e12_16", "peguam", 945, 1047, "Hadiah juara masuk. Bonus penaja masuk. LUNAS."),
    ("e12_17", "bos", 1047, 1128, "Kita lunas!! Buluh FC hidup balik!!"),
    ("e12_18", "karim", 1128, 1223, "Divisyen 4 tunggu. Jumpa kat sana, kapten."),
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
