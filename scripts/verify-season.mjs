import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'story', name), 'utf8'));
const league = read('league.json');
const money = read('season-money.json');
const cast = read('cast.json');
const environments = read('environments.json');

const failures = [];
const passed = [];
function check(name, fn) {
  try {
    fn();
    passed.push(name);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

check('money: freeze terms and retired countdown', () => {
  assert.match(money.freeze.retires, /Hari X/i);
  assert.equal(money.freeze.cureWindow.uses, 1);
  assert.equal(money.instalment, 20000);
});

check('money: income per matchday from league results', () => {
  const income = money.incomeRules;
  for (const month of money.months) {
    let matchIncome = 0;
    let gateIncome = 0;
    for (const md of month.matchdays) {
      const fixture = league.fixtures.find((f) => f.matchday === md && (f.home === 'BLH' || f.away === 'BLH'));
      assert.ok(fixture, `no Buluh fixture on MD${md}`);
      const result = league.results[`${fixture.home}-${fixture.away}`];
      assert.ok(result, `no result for MD${md}`);
      const buluhGoals = fixture.home === 'BLH' ? result.homeGoals : result.awayGoals;
      const rivalGoals = fixture.home === 'BLH' ? result.awayGoals : result.homeGoals;
      const type = buluhGoals > rivalGoals ? 'win' : buluhGoals === rivalGoals ? 'draw' : 'loss';
      matchIncome += income[type];
      if (fixture.home === 'BLH') gateIncome += income.homeGate;
    }
    assert.equal(matchIncome, month.matchIncome, `month ${month.index} match income`);
    assert.equal(gateIncome, month.gateIncome, `month ${month.index} gate income`);
  }
});

check('money: kitty covers each instalment and carries forward', () => {
  let carry = 0;
  for (const month of money.months) {
    const boosts = month.boosts.map((id) => money.boosts.find((b) => b.id === id));
    for (const boost of boosts) assert.ok(boost, `unknown boost in month ${month.index}`);
    const boostTotal = boosts.reduce((sum, b) => sum + b.amount, 0);
    const kitty = month.matchIncome + month.gateIncome + boostTotal + carry;
    assert.equal(kitty, month.kittyBeforeInstalment, `month ${month.index} kitty`);
    assert.ok(kitty >= money.instalment, `month ${month.index} kitty cannot cover instalment`);
    carry = kitty - money.instalment;
    assert.equal(carry, month.carried, `month ${month.index} carry`);
  }
  const boostTotal = money.boosts.reduce((sum, b) => sum + b.amount, 0);
  assert.ok(boostTotal <= 15000, `boosts total ${boostTotal} exceeds 15000`);
  const shockTotal = money.shocks.reduce((sum, s) => sum + s.amount, 0);
  assert.ok(shockTotal <= 20000, `shocks total ${shockTotal} exceeds 20000`);
  assert.ok(money.months.filter((m) => Math.abs(m.kittyBeforeInstalment - money.instalment) <= 5000).length >= 3);
  assert.equal(money.freeze.cureWindow.usedIn, 3);
});

check('money: debt arithmetic and title payout clear the balloon', () => {
  let debt = money.openingDebt;
  assert.equal(debt, 331500);
  debt -= money.instalment * money.months.length;
  debt += money.shocks.reduce((sum, s) => sum + s.amount, 0);
  assert.equal(debt, money.expected.balloonBeforePayout);
  assert.equal(money.titlePayout.championPrize + money.titlePayout.nexusPromotionBonus, money.titlePayout.total);
  assert.equal(money.titlePayout.total, 275000);
  const profit = money.titlePayout.total - debt;
  assert.equal(profit, money.expected.profitAfterPayout);
  assert.ok(profit > 0);
  assert.equal(money.titlePayout.episode, 27);
});

check('league: 8 clubs, 14 matchdays, 4 matches each', () => {
  assert.equal(league.clubs.length, 8);
  assert.equal(league.fixtures.length, 56);
  for (let md = 1; md <= 14; md += 1) {
    assert.equal(league.fixtures.filter((f) => f.matchday === md).length, 4, `MD${md} match count`);
  }
  assert.ok(league.clubs.some((c) => c.id === 'BLH'));
  assert.ok(league.clubs.some((c) => c.id === 'HLU'));
  assert.equal(new Set(league.clubs.map((c) => c.id)).size, 8);
  assert.equal(new Set(league.clubs.flatMap((c) => [c.colors.primary, c.colors.secondary])).size, 16);
});

check('league: every pair meets twice, once home once away', () => {
  const seen = new Map();
  for (const f of league.fixtures) {
    const key = [f.home, f.away].sort().join('-');
    seen.set(key, (seen.get(key) || []).concat(`${f.home}>${f.away}`));
  }
  assert.equal(seen.size, 28);
  for (const [key, legs] of seen) {
    assert.equal(legs.length, 2, `${key} played ${legs.length} times`);
    assert.notEqual(legs[0], legs[1], `${key} legs are not reversed`);
  }
});

check('league: standings recompute with points, head-to-head, goal difference', () => {
  const table = new Map(league.clubs.map((c) => [c.id, {
    id: c.id, pts: 0, gf: 0, ga: 0, gd: 0, h2h: new Map(),
  }]));
  for (let md = 1; md <= 14; md += 1) {
    for (const f of league.fixtures.filter((x) => x.matchday === md)) {
      const r = league.results[`${f.home}-${f.away}`];
      const h = table.get(f.home);
      const a = table.get(f.away);
      h.gf += r.homeGoals; h.ga += r.awayGoals;
      a.gf += r.awayGoals; a.ga += r.homeGoals;
      if (r.homeGoals > r.awayGoals) {
        h.pts += 3;
        h.h2h.set(a.id, (h.h2h.get(a.id) || 0) + 3);
      } else if (r.homeGoals < r.awayGoals) {
        a.pts += 3;
        a.h2h.set(h.id, (a.h2h.get(h.id) || 0) + 3);
      } else {
        h.pts += 1; a.pts += 1;
        h.h2h.set(a.id, (h.h2h.get(a.id) || 0) + 1);
        a.h2h.set(h.id, (a.h2h.get(h.id) || 0) + 1);
      }
    }
    for (const t of table.values()) t.gd = t.gf - t.ga;
    const ordered = [...table.values()].sort((x, y) => {
      if (x.pts !== y.pts) return y.pts - x.pts;
      const xh = x.h2h.get(y.id) || 0;
      const yh = y.h2h.get(x.id) || 0;
      if (xh !== yh) return yh - xh;
      if (x.gd !== y.gd) return y.gd - x.gd;
      return x.id < y.id ? -1 : 1;
    });
    const expected = league.standingsByMatchday[String(md)];
    assert.ok(expected, `missing standings for MD${md}`);
    assert.deepEqual(ordered.map((t) => t.id), expected.map((t) => t.id), `MD${md} order`);
    for (const t of ordered) {
      const e = expected.find((x) => x.id === t.id);
      assert.equal(e.pts, t.pts, `MD${md} ${t.id} points`);
    }
  }
});

check('league: Buluh is not champion before MD14 and wins the title on MD14', () => {
  for (let md = 1; md < 14; md += 1) {
    const table = league.standingsByMatchday[String(md)];
    assert.notEqual(table[0].id, 'BLH', `Buluh top after MD${md}`);
  }
  assert.equal(league.standingsByMatchday['14'][0].id, 'BLH');
  const finalFixture = league.fixtures.find((f) => f.matchday === 14 && (f.home === 'BLH' || f.away === 'BLH'));
  assert.equal(finalFixture.home, 'BLH');
  assert.equal(finalFixture.away, 'HLU');
  const record = { W: 0, D: 0, L: 0 };
  for (let md = 1; md <= 14; md += 1) {
    const f = league.fixtures.find((x) => x.matchday === md && (x.home === 'BLH' || x.away === 'BLH'));
    const r = league.results[`${f.home}-${f.away}`];
    const own = f.home === 'BLH' ? r.homeGoals : r.awayGoals;
    const other = f.home === 'BLH' ? r.awayGoals : r.homeGoals;
    record[own > other ? 'W' : own === other ? 'D' : 'L'] += 1;
  }
  assert.ok(record.L >= 2, `only ${record.L} losses`);
  assert.ok(record.D >= 2, `only ${record.D} draws`);
  const final = league.standingsByMatchday['14'].find((t) => t.id === 'BLH');
  assert.equal(final.pts, 30);
});

check('cast: voice identities are unique within tolerance, narrator never shares', () => {
  const speakers = cast.characters.filter((c) => !c.narrator);
  const narrator = cast.characters.find((c) => c.narrator);
  assert.ok(narrator);
  for (let i = 0; i < speakers.length; i += 1) {
    for (let j = i + 1; j < speakers.length; j += 1) {
      const a = speakers[i];
      const b = speakers[j];
      if (a.voice === b.voice && Math.abs(a.speed - b.speed) <= 0.04 && Math.abs(a.pitch - b.pitch) <= 0.04) {
        throw new Error(`voice collision ${a.id}/${b.id}`);
      }
    }
    assert.notEqual(speakers[i].voice, narrator.voice, `${speakers[i].id} shares narrator voice`);
  }
  assert.deepEqual(cast.voicesAvailable, ['voice_1', 'voice_2', 'voice_3', 'voice_4', 'voice_5', 'voice_6']);
});

check('environments: at least one new set per arc', () => {
  for (const arc of [1, 2, 3, 4]) {
    assert.ok(environments.new.some((e) => e.arc === arc), `arc ${arc} has no new environment`);
  }
});

check('episodes: no HUD value contradicts the canon', () => {
  const episodesDir = path.join(root, 'episodes');
  for (let ep = 6; ep <= 27; ep += 1) {
    const file = path.join(episodesDir, `episode-${ep}`, 'audio-script.json');
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.hud) continue;
    if (data.hud.debt !== undefined) {
      const owed = money.openingDebt - money.instalment * money.months.filter((m) => m.paidInEpisode < ep).length
        + money.shocks.filter((s) => s.episode < ep).reduce((sum, s) => sum + s.amount, 0);
      assert.equal(data.hud.debt, owed, `Ep${ep} HUD debt`);
    }
    if (data.hud.matchday !== undefined) {
      assert.ok(data.hud.matchday >= 1 && data.hud.matchday <= 14, `Ep${ep} HUD matchday`);
    }
  }
});

for (const name of passed) console.log(`PASS ${name}`);
for (const failure of failures) console.error(`FAIL ${failure}`);
console.log(`verify-season: ${passed.length} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
