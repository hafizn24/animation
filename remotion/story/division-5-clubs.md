# Divisyen 5 — 12 Kelab (Season Lock)

> Created for **Episode 7 — *12 Pasukan, Satu Impian*** and locked before the
> matchday scripts, as required by
> [`episode-6-to-22-roadmap.md`](./episode-6-to-22-roadmap.md).
> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md).

**Format (locked):** 12 clubs, single round-robin, **11 matchdays per club**,
**66 league matches**. Win = 3, draw = 1, loss = 0. **1st place is promoted to
Divisyen 4.** No second leg, no playoff, no second promotion place unless a
later episode explicitly changes it.

**Season pressure (locked):** stadium seizure stays frozen until the end of the
Divisyen 5 season under `PERJANJIAN BERSYARAT`. Debt stays **RM326,500** — no
match result, promotion or verbal sponsor offer changes it.

**Buluh FC continuity:** Karim (#8) departed in Episode 5 and never appears.
Captaincy is **vacant** — no Buluh FC player wears an armband, and
`SoccerOutfitApp` must keep `armband.visible = false` for the whole squad.
Azam wears **#7**. Rizal wears **#10**.

---

## The 12 Clubs

| # | id | Club | Colours | Home ground | Playing style | Note |
|---|---|---|---|---|---|---|
| 1 | `buluh` | **Buluh FC** | Red / white | Stadium Buluh | Balanced, fast wingers | Our club. Debt RM326,500. |
| 2 | `harimau-lembah` | **Harimau Lembah FC** | Amber / black stripes | Stadium Lembah Hijau | High press, aggressive | **Matchday 1 opponent** (Episode 6 reveal). |
| 3 | `putra-pelabuhan` | **Putra Pelabuhan FC** | Navy / white | Padang Pelabuhan | Physical, long balls | Oldest club in the league. |
| 4 | `metro-selatan` | **Metro Selatan FC** | Teal / silver | Stesen Metro Arena | Fast counters | Spent big on a foreign striker (Ep. 7 rumour). |
| 5 | `kota-tua` | **Kota Tua FC** | Maroon / cream | Benteng Kota | Possession, patient | Never conceded 3+ at home last season. |
| 6 | `sri-anggerik` | **Sri Anggerik FC** | Purple / gold | Taman Anggerik | Technical, short passing | Academy side, youngest squad. |
| 7 | `puncak-bumi` | **Puncak Bumi FC** | Forest green / yellow | Padang Puncak | Direct, aerial | Coldest ground in the league. |
| 8 | `bintang-timur` | **Bintang Timur FC** | Red / white | Stadium Bintang | Disciplined, low block | Best defence last season. |
| 9 | `rimba-raya` | **Rimba Raya FC** | Dark green / orange | Padang Rimba | Rugged, set pieces | Toughest away trip. |
| 10 | `sungai-bunyi` | **Sungai Bunyi FC** | Yellow / blue | Padang Sungai Bunyi | Wing play, crossing | loudest support. |
| 11 | `padang-lalang` | **Padang Lalang FC** | Red / green | Padang Lalang | Grassroots, fearless | Promoted from Divisyen 6. |
| 12 | `menara-gading` | **Menara Gading FC** | Ivory / navy | Kolej Menara | Tactical, set-piece | Coached by a former internationals. |

> Kit palettes for `characters/core/kits.js` `DIVISION_5_CLUBS` must be derived
> from this table. Buluh FC keeps the existing red/white stripe kit.

---

## Fixture Order (locked — 66 matches)

Single round-robin, circle-method schedule. Buluh FC plays **home** first in
every round as listed. **Matchday 1 is canon** from the Episode 6 reveal:
`BULUH FC vs HARIMAU LEMBAH FC`.

| MD | Fixtures |
|---|---|
| 1 | buluh vs harimau-lembah · putra-pelabuhan vs menara-gading · metro-selatan vs padang-lalang · kota-tua vs sungai-bunyi · sri-anggerik vs rimba-raya · puncak-bumi vs bintang-timur |
| 2 | buluh vs menara-gading · harimau-lembah vs padang-lalang · putra-pelabuhan vs sungai-bunyi · metro-selatan vs rimba-raya · kota-tua vs bintang-timur · sri-anggerik vs puncak-bumi |
| 3 | buluh vs padang-lalang · menara-gading vs sungai-bunyi · harimau-lembah vs rimba-raya · putra-pelabuhan vs bintang-timur · metro-selatan vs puncak-bumi · kota-tua vs sri-anggerik |
| 4 | buluh vs sungai-bunyi · padang-lalang vs rimba-raya · menara-gading vs bintang-timur · harimau-lembah vs puncak-bumi · putra-pelabuhan vs sri-anggerik · metro-selatan vs kota-tua |
| 5 | buluh vs rimba-raya · sungai-bunyi vs bintang-timur · padang-lalang vs puncak-bumi · menara-gading vs sri-anggerik · harimau-lembah vs kota-tua · putra-pelabuhan vs metro-selatan |
| 6 | buluh vs bintang-timur · rimba-raya vs puncak-bumi · sungai-bunyi vs sri-anggerik · padang-lalang vs kota-tua · menara-gading vs metro-selatan · harimau-lembah vs putra-pelabuhan |
| 7 | buluh vs puncak-bumi · bintang-timur vs sri-anggerik · rimba-raya vs kota-tua · sungai-bunyi vs metro-selatan · padang-lalang vs putra-pelabuhan · menara-gading vs harimau-lembah |
| 8 | buluh vs sri-anggerik · puncak-bumi vs kota-tua · bintang-timur vs metro-selatan · rimba-raya vs putra-pelabuhan · sungai-bunyi vs harimau-lembah · padang-lalang vs menara-gading |
| 9 | buluh vs kota-tua · sri-anggerik vs metro-selatan · puncak-bumi vs putra-pelabuhan · bintang-timur vs harimau-lembah · rimba-raya vs menara-gading · sungai-bunyi vs padang-lalang |
| 10 | buluh vs metro-selatan · kota-tua vs putra-pelabuhan · sri-anggerik vs harimau-lembah · puncak-bumi vs menara-gading · bintang-timur vs padang-lalang · rimba-raya vs sungai-bunyi |
| 11 | buluh vs putra-pelabuhan · metro-selatan vs harimau-lembah · kota-tua vs menara-gading · sri-anggerik vs padang-lalang · puncak-bumi vs sungai-bunyi · bintang-timur vs rimba-raya |

Buluh FC's own run: **MD1 Harimau Lembah (H) · MD2 Menara Gading (H) ·
MD3 Padang Lalang (H) · MD4 Sungai Bunyi (H) · MD5 Rimba Raya (H) ·
MD6 Bintang Timur (H) · MD7 Puncak Bumi (H) · MD8 Sri Anggerik (H) ·
MD9 Kota Tua (H) · MD10 Metro Selatan (H) · MD11 Putra Pelabuhan (H).**

> Home/away alternation is intentionally simplified for on-screen fixture
> boards; a matchday script that needs a true away trip may relabel the venue
> in dialogue without changing the pairing or the matchday number.

---

## Roster (Buluh FC)

| Player | Number | Position | Salary | Notes |
|---|---|---|---|---|
| Azam | **#7** | Defender | RM5 | Joined Episode 5. Fan character `@akudingin-d1f`. |
| Rizal | **#10** | Midfielder | — | Locker-room voice since Episode 3; Episode 7 foil. |
| Squad extras | — | Mixed | — | `SquadVariationsApp`, no armbands. |
| Karim | ~~#8~~ | — | — | **Departed Episode 5. Never shown.** |

Captaincy: **vacant**. The armband stays on Boss's desk.

---

## Open items

- Matchday 2+ result lines and any away-trip dialogue must be written against
  this table; do not invent new pairings on the fly.
- Kit colour assignments for the 11 opponent clubs in `kits.js` should be
  added when a club first appears on screen.
- `division-5-clubs.md` is the source of truth for the league. If an episode
  contradicts it, fix the episode, not this file.
