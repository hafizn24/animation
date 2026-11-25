import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Recomputes the Divisyen 5 table from the fixture list and fails if the
 * snapshots in story/division5-league.json disagree.
 * Tiebreak: head-to-head points/goal difference, then overall goal difference.
 * Clubs that are still completely level may keep any order in the JSON.
 */
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const leaguePath = path.join(root, 'story', 'division5-league.json');
const league = JSON.parse(fs.readFileSync(leaguePath, 'utf8'));

const clubs = league.teams.map((team) => team.short);
const PT = league.format.points;

const blankStats = () =>
  Object.fromEntries(clubs.map((club) => [club, { points: 0, played: 0, gf: 0, ga: 0, h2h: {} }]));

const recordH2H = (stats, home, homeGoals, away, awayGoals) => {
  const a = stats[home].h2h[away] ?? { pts: 0, gd: 0 };
  const b = stats[away].h2h[home] ?? { pts: 0, gd: 0 };
  const diff = homeGoals - awayGoals;
  a.pts += diff > 0 ? PT.win : diff < 0 ? PT.loss : PT.draw;
  b.pts += diff > 0 ? PT.loss : diff < 0 ? PT.win : PT.draw;
  a.gd += diff;
  b.gd -= diff;
  stats[home].h2h[away] = a;
  stats[away].h2h[home] = b;
};

const statsAfter = (matchday) => {
  const stats = blankStats();
  for (const day of league.schedule.filter((entry) => entry.matchday <= matchday)) {
    for (const [home, homeGoals, away, awayGoals] of day.fixtures) {
      assert.ok(stats[home] && stats[away], `unknown club in ${home} vs ${away}`);
      assert.equal(typeof homeGoals, 'number', `missing score in ${home} vs ${away}`);
      stats[home].played += 1;
      stats[away].played += 1;
      stats[home].gf += homeGoals;
      stats[home].ga += awayGoals;
      stats[away].gf += awayGoals;
      stats[away].ga += homeGoals;
      if (homeGoals > awayGoals) {
        stats[home].points += PT.win;
        stats[away].points += PT.loss;
      } else if (homeGoals < awayGoals) {
        stats[home].points += PT.loss;
        stats[away].points += PT.win;
      } else {
        stats[home].points += PT.draw;
        stats[away].points += PT.draw;
      }
      recordH2H(stats, home, homeGoals, away, awayGoals);
    }
  }
  return stats;
};

const gd = (stat) => stat.gf - stat.ga;

const compare = (stats, a, b) => {
  if (stats[a].points !== stats[b].points) return stats[b].points - stats[a].points;
  const h2h = stats[a].h2h[b];
  if (h2h && h2h.pts !== 0) return -h2h.pts;
  if (h2h && h2h.gd !== 0) return -h2h.gd;
  if (gd(stats[a]) !== gd(stats[b])) return gd(stats[b]) - gd(stats[a]);
  return 0;
};

for (const day of league.schedule) {
  const md = day.matchday;
  const rows = league.standings[String(md)];
  assert.ok(rows, `missing standings snapshot for MD${md}`);
  assert.equal(rows.length, clubs.length, `MD${md} table needs ${clubs.length} rows`);
  assert.deepEqual(
    rows.map((row) => row.pos),
    rows.map((_, index) => index + 1),
    `MD${md} positions must be 1..${clubs.length}`
  );
  assert.deepEqual(
    [...rows.map((row) => row.club)].sort(),
    [...clubs].sort(),
    `MD${md} table must contain every club exactly once`
  );

  const stats = statsAfter(md);
  for (const row of rows) {
    assert.equal(row.played, stats[row.club].played, `MD${md} ${row.club} played`);
    assert.equal(row.points, stats[row.club].points, `MD${md} ${row.club} points`);
  }
  for (let i = 0; i < rows.length - 1; i += 1) {
    const order = compare(stats, rows[i].club, rows[i + 1].club);
    assert.ok(
      order <= 0,
      `MD${md} order: ${rows[i].club} (${rows[i].points}pts) must rank above ${rows[i + 1].club} (${rows[i + 1].points}pts)`
    );
  }
}

console.log('LEAGUE CHECKS PASSED — standings match the fixture list after MD1–MD5');
