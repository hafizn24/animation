import assert from 'node:assert';
import { App } from './characters/character-default.js';
import { SuitOutfitApp } from './characters/character-suit.js';
import { SoccerCoachOutfitApp } from './characters/character-coach.js';
import { SoccerOutfitApp } from './characters/character-soccer.js';
import { AnotherCasualOutfitApp } from './characters/character-casual.js';
import { ChairmanApp } from './characters/character-chairman.js';
import { NewOwnerApp } from './characters/character-new-owner.js';
import { SponsorApp } from './characters/character-sponsor.js';
import { KarimApp } from './characters/character-karim.js';
import { AzamApp } from './characters/character-azam.js';
import { KarimAwayApp } from './characters/character-karim-away.js';
import { ClubOfficeApp } from './environments/club-office.js';
import { HAIR_STYLES } from './characters/character-hair.js';
import { CharacterInspector } from './Inspector.js';

// Minimal canvas stub so the canvas-textured characters can build in Node
if (typeof globalThis.document === 'undefined') {
  const ctx = new Proxy({}, {
    get: (t, p) => {
      if (p === 'createLinearGradient' || p === 'createRadialGradient') {
        return () => ({ addColorStop() {} });
      }
      return () => {};
    },
    set: () => true,
  });
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
}

const container = { clientWidth: 800, clientHeight: 600, appendChild() {}, removeChild() {} };
const manager = new App(container);

manager.setupScene();
manager.addLights();

const char = manager.createProceduralCharacter();
assert.strictEqual(char.children.length, 7, 'procedural character has 7 part groups');

const inspector = new CharacterInspector(manager);
inspector.character = char;
inspector.inspectorPanel = { innerHTML: '' };

inspector.update();
assert.ok(inspector.inspectorPanel.innerHTML.includes('Character Inspector'), 'panel renders');
assert.ok(inspector.inspectorPanel.innerHTML.includes('Head'), 'lists named child objects');

inspector.selectObject(2);
assert.strictEqual(inspector.selectedObject, char.children[2], 'selection works');

manager.resetScene();
assert.ok(manager.character, 'resetScene rebuilds character');
assert.strictEqual(manager.character.children.length, 7, 'rebuilt character has 7 part groups');
assert.strictEqual(manager.scene.children.filter(c => c.isLight).length, 2, 'resetScene restores 2 lights');

assert.strictEqual(inspector.sanitize('abc'), 'NaN', 'sanitize NaN');
assert.strictEqual(inspector.sanitize(1.23456), '1.235', 'sanitize rounds');

// --- The whole cast shares one standardised rig ---
const CAST = [
  [App, 'Default', []],
  [SuitOutfitApp, 'Suit', []],
  [SoccerCoachOutfitApp, 'Coach', []],
  [SoccerOutfitApp, 'Soccer', []],
  [AnotherCasualOutfitApp, 'Casual', []],
  [ChairmanApp, 'Chairman', ['idle', 'walk', 'stride', 'thoughtful', 'gavel', 'pipe']],
  [NewOwnerApp, 'NewOwner', ['idle', 'walkA', 'walkB', 'walkC', 'handshake', 'document', 'coffee', 'keys']],
  [SponsorApp, 'Sponsor', ['idle', 'walk', 'dismiss', 'offer', 'phone', 'checkWatch']],
];

for (const [Cls, label, poses] of CAST) {
  const actor = new Cls(container);
  actor.setupScene();
  actor.addLights();

  const body = actor.createProceduralCharacter();
  assert.strictEqual(body.children.length, 7, `${label} has 7 part groups`);

  // Every character wears a hairstyle
  const hair = actor.characterParts.head.getObjectByName('Hair');
  assert.ok(hair, `${label} has a hairstyle group`);
  assert.ok(hair.children.length > 0, `${label} hairstyle has geometry`);
  assert.ok(HAIR_STYLES.includes(actor.hairStyle), `${label} uses a known hairstyle`);

  // Hands are mittens - no separate finger meshes
  const hand = actor.characterParts.leftArm.getObjectByName('Hand');
  assert.ok(hand, `${label} has a hand group`);
  let fingers = 0;
  hand.traverse((child) => {
    if (child.isMesh && child.geometry.type === 'CapsuleGeometry') fingers++;
  });
  assert.strictEqual(fingers, 0, `${label} hand has no separate fingers`);

  // Hairstyles can be swapped
  actor.changeHairStyle('afro');
  const swapped = actor.characterParts.head.getObjectByName('Hair');
  assert.ok(swapped && swapped.children.length > 0, `${label} hairstyle can be swapped`);

  // Every pose in the library applies without throwing
  if (typeof actor.setPose === 'function') {
    for (const pose of poses) {
      actor.setPose(pose);
      assert.strictEqual(actor.currentPose, pose, `${label} pose "${pose}" applied`);
    }
    actor.setPose('idle');
  }
  actor.dispose();
  assert.strictEqual(actor.character, null, `${label} disposes cleanly`);
}

// --- Episode 4 assets: Karim rig and the ClubOffice set ---
const karim = new KarimApp(container);
karim.setupScene();
karim.addLights();
const karimBody = karim.createProceduralCharacter();
assert.strictEqual(karimBody.children.length, 7, 'Karim has 7 part groups');
assert.ok(karimBody.getObjectByName('Head').getObjectByName('Hair'), 'Karim has a hairstyle');
assert.ok(karim.characterParts.backPanel, 'Karim jersey has a back name panel');
assert.ok(karim.characterParts.frontPanel, 'Karim jersey has a front name panel');
assert.ok(karim.characterParts.boots, 'Karim carries a boots prop');
assert.ok(karim.characterParts.leftArm.getObjectByName('Hand'), 'Karim has a hand group');
karim.dispose();
assert.strictEqual(karim.character, null, 'Karim disposes cleanly');

// --- Episode 5: Azam (#7) shares Karim's rig contract ---
const azam = new AzamApp(container);
azam.setupScene();
azam.addLights();
const azamBody = azam.createProceduralCharacter();
assert.strictEqual(azamBody.children.length, 7, 'Azam has 7 part groups');
assert.ok(azamBody.getObjectByName('Head').getObjectByName('Hair'), 'Azam has a hairstyle');
assert.ok(azam.characterParts.backPanel, 'Azam jersey has a back name panel');
assert.ok(azam.characterParts.frontPanel, 'Azam jersey has a front name panel');
assert.ok(azam.characterParts.boots, 'Azam exposes the Karim-compatible boots slot');
assert.ok(azam.characterParts.leftArm.getObjectByName('Hand'), 'Azam has a hand group');
assert.strictEqual(azamBody.getObjectByName('Hair').children.length > 0, true, 'Azam quiff has geometry');
['idle', 'stride', 'reveal', 'flex', 'point'].forEach((pose) => {
  azam.setPose(pose);
  assert.strictEqual(azam.currentPose, pose, `Azam pose "${pose}" applied`);
});
azam.dispose();
assert.strictEqual(azam.character, null, 'Azam disposes cleanly');

// --- Episode 12 finale: KarimAwayApp — Divisyen 4 kit + Buluh scarf ---
const karimAway = new KarimAwayApp(container);
karimAway.setupScene();
karimAway.addLights();
const karimAwayBody = karimAway.createProceduralCharacter();
assert.strictEqual(karimAwayBody.children.length, 7, 'KarimAway has 7 part groups');
assert.ok(karimAwayBody.getObjectByName('Head').getObjectByName('Hair'), 'KarimAway has a hairstyle');
assert.ok(karimAway.characterParts.backPanel, 'KarimAway jersey has a back name panel');
assert.ok(karimAway.characterParts.frontPanel, 'KarimAway jersey has a front name panel');
assert.ok(karimAway.characterParts.scarf, 'KarimAway wears the Buluh scarf');
assert.ok(karimAway.characterParts.boots, 'KarimAway keeps the boots slot for API parity');
assert.strictEqual(karimAway.characterParts.boots.visible, false, 'KarimAway boots stay hidden (spectator)');
assert.ok(karimAway.characterParts.leftArm.getObjectByName('Hand'), 'KarimAway has a hand group');
karimAway.setBootsVisible(true);
assert.strictEqual(karimAway.characterParts.boots.visible, true, 'KarimAway boots can be shown');
karimAway.setBootsVisible(false);
karimAway.changeHairStyle('afro');
karimAway.dispose();
assert.strictEqual(karimAway.character, null, 'KarimAway disposes cleanly');

const office = new ClubOfficeApp(container);
office.setupScene();
office.addLights();
const officeSet = office.createProceduralCharacter();
assert.ok(officeSet, 'ClubOffice builds a procedural set');
['offerSheet', 'pen', 'whiteboard', 'doorHinge', 'hallwayGlow'].forEach((key) => {
  assert.ok(office.anchors[key], `ClubOffice exposes ${key} hero prop`);
});
assert.ok(office.lights.lamp && office.lights.hallway, 'ClubOffice has lamp and hallway lights');
office.dispose();
assert.strictEqual(office.character, null, 'ClubOffice disposes cleanly');

// --- Season 1 (Ep. 6-12) new rig variants and modular pitch environments ---
const VARIANTS = [
  [FaridApp, 'Farid #9', ['point', 'block', 'celebrate', 'intercept', 'talk']],
  [DanialApp, 'Danial #1 GK', ['panic', 'crouch']],
  [ZakiApp, 'Kapten Zaki #10', ['talk', 'point', 'stride']],
  [PakDinApp, 'Pak Din #6', ['talk', 'stride']],
  [RayyanApp, 'Rayyan #11', ['stride', 'panic']],
  [BobApp, 'Kapten Bob #9', ['celebrate', 'stride', 'panic']],
  [MalikApp, 'Kapten Malik #4', ['block', 'idle']],
  [BesiKeeperApp, 'Penjaga Gol Besi #1', ['crouch', 'panic']],
  [RefereeApp, 'PENGADIL', ['point', 'talk']],
];

for (const [Cls, label, poses] of VARIANTS) {
  const actor = new Cls(container);
  actor.setupScene();
  actor.addLights();
  const body = actor.createProceduralCharacter();
  assert.strictEqual(body.children.length, 7, `${label} has 7 part groups`);
  assert.ok(body.getObjectByName('Head').getObjectByName('Hair'), `${label} has a hairstyle`);
  assert.ok(actor.characterParts.backPanel && actor.characterParts.frontPanel, `${label} has jersey name panels`);
  assert.ok(actor.characterParts.leftArm.getObjectByName('Hand'), `${label} has a hand group`);
  for (const pose of poses) {
    actor.setPose(pose);
    assert.strictEqual(actor.currentPose, pose, `${label} pose "${pose}" applied`);
  }
  actor.dispose();
  assert.strictEqual(actor.character, null, `${label} disposes cleanly`);
}

const PITCH_ZONES = [
  [PitchCenterCircleApp, 'centerSpot', 'Pitch center circle'],
  [PitchPenaltyBoxApp, 'goal', 'Pitch penalty box'],
  [PitchTouchlineApp, 'adBoard', 'Pitch touchline'],
];
for (const [Cls, anchor, label] of PITCH_ZONES) {
  const pitch = new Cls(container);
  pitch.setupScene();
  pitch.addLights();
  assert.ok(pitch.createProceduralCharacter(), `${label} builds geometry`);
  assert.ok(pitch.anchors[anchor], `${label} exposes ${anchor}`);
  assert.ok(pitch.anchors.ball, `${label} exposes the ball`);
  assert.ok(pitch.lights.sun, `${label} has a sun light`);
  pitch.dispose();
}

const tunnel = new MatchTunnelApp(container);
tunnel.setupScene();
tunnel.addLights();
assert.ok(tunnel.createProceduralCharacter(), 'MatchTunnel builds geometry');
assert.ok(tunnel.anchors.exitGlow && tunnel.anchors.banner, 'MatchTunnel exposes exit + banner anchors');
tunnel.dispose();

const crisis = new PitchCrisisNightApp(container);
crisis.setupScene();
crisis.addLights();
assert.ok(crisis.createProceduralCharacter(), 'PitchCrisisNight builds geometry');
assert.ok(crisis.anchors.floodTower && crisis.anchors.cautionTape && crisis.anchors.sparks, 'Crisis exposes floodlight + tape + sparks');
crisis.setCrisisFrame(30);
assert.ok(crisis.lights.flood.intensity < 11, 'Crisis floodlight flickers off');
crisis.dispose();

// --- Episode 12 finale set: the hero grandstand ---
const { PitchHeroStandApp, heroStandGrade } = await import('./environments/pitch-hero-stand.js');
const heroStand = new PitchHeroStandApp(container);
heroStand.setupScene();
heroStand.addLights();
assert.ok(heroStand.createProceduralCharacter(), 'PitchHeroStand builds geometry');
['heroStand', 'heroSpot', 'banner', 'rail', 'flags', 'confetti', 'heroCrowd', 'ball', 'goal'].forEach((key) => {
  assert.ok(heroStand.anchors[key], `PitchHeroStand exposes ${key}`);
});
assert.ok(heroStand.lights.sun, 'PitchHeroStand has the flood key light');
heroStandGrade(heroStand.scene, heroStand);
heroStand.setBanner('BULUH FC');
heroStand.flipBanner();
heroStand.updateCrowd(30, 0.9);
heroStand.updateConfetti(30, false);
assert.strictEqual(heroStand.anchors.confetti.visible, false, 'confetti hidden before the title');
heroStand.updateConfetti(30, true);
assert.strictEqual(heroStand.anchors.confetti.visible, true, 'confetti visible after the title');
heroStand.updateConfetti(60, true);
heroStand.dispose();
assert.strictEqual(heroStand.character, null, 'PitchHeroStand disposes cleanly');

console.log('ALL CHECKS PASSED');
