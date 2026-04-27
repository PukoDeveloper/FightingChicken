import { Container, Graphics } from 'pixi.js';
import type { EnemyType } from '../constants';
import type { CostumeId } from './costumes';

// ─── Chicken (小雞) ──────────────────────────────────────────────────────────
/**
 * Build a Container whose children form the chicken character.
 * The container's local origin (0,0) is the chicken's centre.
 */
export function createChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.25 });

  // Left wing
  g.ellipse(-18, 6, 10, 7).fill(0xffbb00);

  // Body
  g.circle(0, 0, 22).fill(0xffd700);

  // Belly highlight
  g.ellipse(4, 6, 11, 9).fill(0xffe966);

  // Comb (red, three bumps)
  g.moveTo(-8, -20).lineTo(-3, -32).lineTo(1, -21)
    .lineTo(5, -31).lineTo(9, -21).lineTo(13, -20)
    .closePath().fill(0xff3333);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0xffbb00);

  // Beak
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xff8800);

  // Eye white
  g.circle(12, -7, 6).fill(0xffffff);
  // Pupil
  g.circle(13, -6, 3).fill(0x111111);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xffffff);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xff8800);
  g.rect(-14, 31, 11, 3).fill(0xff8800);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xff8800);
  g.rect(3, 31, 11, 3).fill(0xff8800);

  // Hitbox dot (visible to player as aiming guide)
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Wingman Chicken (僚雞) ───────────────────────────────────────────────────
import type { WingmanDef } from './wingmen';

/**
 * Build a Container for a wingman companion chicken with a colour scheme
 * determined by the wingman's bodyColor and accentColor.
 * The container's local origin (0,0) is the chicken's centre.
 */
export function createWingmanDisplay(def: WingmanDef): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 22, 14, 4).fill({ color: 0x000000, alpha: 0.20 });

  // Left wing (each channel darkened independently from body colour)
  const wR = Math.max(0, ((def.bodyColor >> 16) & 0xff) - 0x22);
  const wG = Math.max(0, ((def.bodyColor >> 8)  & 0xff) - 0x33);
  const wB = Math.max(0, ( def.bodyColor        & 0xff) - 0x44);
  const wingColor = (wR << 16) | (wG << 8) | wB;
  g.ellipse(-14, 4, 8, 6).fill(wingColor);

  // Body
  g.circle(0, 0, 18).fill(def.bodyColor);

  // Belly highlight (lightened blend towards white)
  const bellyR = Math.min(255, ((def.bodyColor >> 16) & 0xff) + 60);
  const bellyG = Math.min(255, ((def.bodyColor >> 8)  & 0xff) + 60);
  const bellyB = Math.min(255,  (def.bodyColor        & 0xff) + 80);
  const bellyColor = (bellyR << 16) | (bellyG << 8) | bellyB;
  g.ellipse(3, 5, 9, 7).fill(bellyColor);

  // Comb (accent colour)
  g.moveTo(-6, -16).lineTo(-2, -26).lineTo(1, -17)
    .lineTo(4, -25).lineTo(7, -17).lineTo(10, -16)
    .closePath().fill(def.accentColor);

  // Right wing (same darker shade)
  g.ellipse(15, 4, 8, 6).fill(wingColor);

  // Beak
  g.moveTo(14, -2).lineTo(22, 2).lineTo(14, 6).closePath().fill(0xff8800);

  // Eye white
  g.circle(10, -6, 5).fill(0xffffff);
  // Pupil
  g.circle(11, -5, 2.5).fill(0x111111);
  // Eye glint
  g.circle(12, -7, 1).fill(0xffffff);

  // Left foot
  g.rect(-7, 18, 2.5, 8).fill(0xff8800);
  g.rect(-11, 25, 9, 2.5).fill(0xff8800);

  // Right foot
  g.rect(5, 18, 2.5, 8).fill(0xff8800);
  g.rect(2, 25, 9, 2.5).fill(0xff8800);

  c.addChild(g);
  return c;
}

// ─── Courage Boss (勇氣) ──────────────────────────────────────────────────────
/**
 * Build a Container for the Courage boss character.
 * Origin at centre of face.
 */
export function createCourageDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow ring
  g.circle(0, 0, 58).fill({ color: 0x9900cc, alpha: 0.08 });
  g.circle(0, 0, 52).fill({ color: 0xdd00ff, alpha: 0.05 });

  // Left horn
  g.moveTo(-28, -36).lineTo(-18, -58).lineTo(-8, -36).closePath().fill(0xff4400);
  // Right horn
  g.moveTo(8, -36).lineTo(18, -58).lineTo(28, -36).closePath().fill(0xff4400);

  // Body/face base
  g.circle(0, 0, 44).fill(0x8b0000);
  // Face skin
  g.circle(0, 0, 40).fill(0xcc2200);

  // Left eyebrow (angry diagonal)
  g.moveTo(-32, -20).lineTo(-11, -26).lineTo(-11, -22).lineTo(-32, -16).closePath().fill(0x111111);
  // Right eyebrow
  g.moveTo(11, -26).lineTo(32, -20).lineTo(32, -16).lineTo(11, -22).closePath().fill(0x111111);

  // Left eye white
  g.circle(-18, -8, 11).fill(0xffee00);
  // Left pupil
  g.circle(-18, -8, 6).fill(0x110000);
  // Left glint
  g.circle(-14, -12, 2.5).fill(0xffffff);

  // Right eye white
  g.circle(18, -8, 11).fill(0xffee00);
  // Right pupil
  g.circle(18, -8, 6).fill(0x110000);
  // Right glint
  g.circle(22, -12, 2.5).fill(0xffffff);

  // Mouth area (white background)
  g.arc(0, 12, 22, 0.05, Math.PI - 0.05).fill(0xffffff);
  // Gum / dark inner
  g.arc(0, 14, 16, 0.15, Math.PI - 0.15).fill(0x550000);

  // Teeth (four white rects)
  for (let i = -2; i <= 1; i++) {
    g.rect(i * 9 - 3, 12, 7, 10).fill(0xffffff);
  }

  c.addChild(g);
  return c;
}

// ─── Courage hit-flash overlay ───────────────────────────────────────────────
/** Returns a full-white circle to layer over the enemy sprite on hit. */
export function createEnemyHitFlash(radius: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, radius).fill({ color: 0xffffff, alpha: 0.6 });
  g.visible = false;
  return g;
}

/** @deprecated Use createEnemyHitFlash(44) instead. */
export function createCourageHitFlash(): Graphics {
  return createEnemyHitFlash(44);
}

// ─── Pet Guardian (寵物護衛) ──────────────────────────────────────────────────
/**
 * A compact purple guardian creature that protects the Chaos boss in phase 3.
 * Smaller than the boss; origin at centre.
 */
export function createPetDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow
  g.circle(0, 0, 28).fill({ color: 0x8800cc, alpha: 0.14 });

  // Swept-back wings
  g.ellipse(-20, 4, 12, 6).fill({ color: 0x5500aa, alpha: 0.88 });
  g.ellipse(20, 4, 12, 6).fill({ color: 0x5500aa, alpha: 0.88 });

  // Body outer ring
  g.circle(0, 0, 18).fill(0x200028);
  // Body inner
  g.circle(0, 0, 14).fill(0x3c0048);
  // Swirl highlight
  g.ellipse(5, -3, 7, 5).fill({ color: 0x9900cc, alpha: 0.30 });

  // Four eyes in a diamond arrangement
  const eyePos: [number, number][] = [[-8, -6], [8, -6], [-5, 5], [5, 5]];
  for (const [ex, ey] of eyePos) {
    g.circle(ex, ey, 4).fill({ color: 0xff44ee, alpha: 0.45 });
    g.circle(ex, ey, 2.5).fill(0xff88ff);
    g.circle(ex, ey, 1.2).fill(0x110011);
    g.circle(ex + 0.8, ey - 0.8, 0.7).fill(0xffffff);
  }

  // Tiny jagged maw
  g.poly([-7, 12, -4, 9, -1, 12, 2, 9, 5, 12, 7, 9, 7, 14, -7, 14]).fill(0x110011);

  c.addChild(g);
  return c;
}

// ─── Enemy factory ────────────────────────────────────────────────────────────

/** Create the correct enemy display Container for the given enemy type. */
export function createEnemyDisplay(type: EnemyType): Container {
  switch (type) {
    case 'phantom':   return createPhantomDisplay();
    case 'chaos':     return createChaosDisplay();
    case 'blackhole': return createBlackHoleDisplay();
    case 'mech':      return createMechDisplay();
    case 'storm':     return createStormDisplay();
    case 'dragon':    return createDragonDisplay();
    default:          return createCourageDisplay();
  }
}

// ─── Phantom Boss (幽靈) ──────────────────────────────────────────────────────
/**
 * Build a Container for the Phantom boss.
 * A spectral blue-purple ghost with glowing cyan eyes.
 * Origin at centre of face.
 */
export function createPhantomDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer ethereal aura
  g.circle(0, 0, 58).fill({ color: 0x2244cc, alpha: 0.07 });
  g.circle(0, 0, 50).fill({ color: 0x4466ff, alpha: 0.05 });

  // Left wispy tendril
  g.ellipse(-34, 30, 7, 22).fill({ color: 0x3355dd, alpha: 0.55 });
  // Right wispy tendril
  g.ellipse(34, 30, 7, 22).fill({ color: 0x3355dd, alpha: 0.55 });
  // Centre tendril
  g.ellipse(0, 38, 9, 20).fill({ color: 0x2244cc, alpha: 0.55 });

  // Body base (dark)
  g.circle(0, 0, 44).fill(0x1a0a44);
  // Body skin (translucent blue)
  g.circle(0, 0, 40).fill({ color: 0x3344bb, alpha: 0.92 });
  // Inner body highlight
  g.ellipse(-8, -8, 20, 16).fill({ color: 0x5566ee, alpha: 0.30 });

  // Left eyebrow (calm, slight arch)
  g.moveTo(-28, -22).lineTo(-10, -26).lineTo(-10, -22).lineTo(-28, -18).closePath().fill(0x110033);
  // Right eyebrow
  g.moveTo(10, -26).lineTo(28, -22).lineTo(28, -18).lineTo(10, -22).closePath().fill(0x110033);

  // Left eye glow (outer)
  g.circle(-16, -8, 12).fill({ color: 0x00ddff, alpha: 0.35 });
  // Left eye white
  g.circle(-16, -8, 9).fill(0xaaeeff);
  // Left pupil (slit-like)
  g.ellipse(-16, -8, 3, 7).fill(0x000022);
  // Left glint
  g.circle(-13, -11, 2).fill(0xffffff);

  // Right eye glow
  g.circle(16, -8, 12).fill({ color: 0x00ddff, alpha: 0.35 });
  // Right eye white
  g.circle(16, -8, 9).fill(0xaaeeff);
  // Right pupil
  g.ellipse(16, -8, 3, 7).fill(0x000022);
  // Right glint
  g.circle(19, -11, 2).fill(0xffffff);

  // Jagged spectral mouth
  const mouthPts = [-20, 14, -12, 10, -6, 16, 0, 10, 6, 16, 12, 10, 20, 14];
  g.poly([-20, 20, ...mouthPts, 20, 20]).fill(0x110033);

  c.addChild(g);
  return c;
}

// ─── Chaos Boss (混沌) ────────────────────────────────────────────────────────
/**
 * Build a Container for the Chaos boss.
 * A dark, many-eyed swirling entity with a jagged outer shell.
 * Origin at centre of face.
 */
export function createChaosDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer chaotic aura
  g.circle(0, 0, 62).fill({ color: 0x660000, alpha: 0.08 });
  g.circle(0, 0, 54).fill({ color: 0xcc00cc, alpha: 0.05 });

  // Spiky outer shell (12-point star)
  const spikes = 12;
  const spikeOuter = 52;
  const spikeInner = 42;
  const spikePoints: number[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? spikeOuter : spikeInner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    spikePoints.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(spikePoints).fill(0x220022);

  // Body base
  g.circle(0, 0, 42).fill(0x1a0022);
  // Body inner
  g.circle(0, 0, 38).fill(0x2d0035);
  // Swirl highlight
  g.ellipse(10, -6, 18, 14).fill({ color: 0x880088, alpha: 0.28 });
  g.ellipse(-12, 10, 16, 12).fill({ color: 0x0044cc, alpha: 0.20 });

  // Six small red eyes arranged in a ring
  const eyeCount = 6;
  for (let i = 0; i < eyeCount; i++) {
    const a = (i / eyeCount) * Math.PI * 2 - Math.PI / 2;
    const ex = Math.cos(a) * 22;
    const ey = Math.sin(a) * 22;
    g.circle(ex, ey, 7).fill({ color: 0xff2200, alpha: 0.45 });
    g.circle(ex, ey, 5).fill(0xff4400);
    g.circle(ex, ey, 2.5).fill(0x000000);
    g.circle(ex + 1.5, ey - 1.5, 1).fill(0xffffff);
  }

  // Central large eye
  g.circle(0, 0, 11).fill({ color: 0xff8800, alpha: 0.5 });
  g.circle(0, 0, 8).fill(0xffcc00);
  g.circle(0, 0, 4).fill(0x110000);
  g.circle(2, -2, 1.5).fill(0xffffff);

  // Jagged maw at bottom
  const mawPts: number[] = [];
  for (let i = 0; i <= 8; i++) {
    const jx = -24 + i * 6;
    const jy = i % 2 === 0 ? 30 : 22;
    mawPts.push(jx, jy);
  }
  g.poly([-24, 38, ...mawPts, 24, 38]).fill(0x110000);

  c.addChild(g);
  return c;
}

// ─── Mech Boss (機甲) ─────────────────────────────────────────────────────────
/**
 * Build a Container for the Mech boss.
 * A robotic armoured chicken with glowing red eyes, steel plating, and
 * a sensor antenna. Origin at centre of the head/body.
 */
export function createMechDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer energy field (electric blue glow)
  g.circle(0, 0, 58).fill({ color: 0x0044aa, alpha: 0.07 });
  g.circle(0, 0, 50).fill({ color: 0x0088ff, alpha: 0.04 });

  // 8-point armour shell
  const spikes = 8;
  const spikeOuter = 46;
  const spikeInner = 38;
  const pts: number[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? spikeOuter : spikeInner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(pts).fill(0x1a2a3a);

  // Main body plates
  g.circle(0, 0, 38).fill(0x182028);
  g.circle(0, 0, 34).fill(0x253545);

  // Subtle circuit line highlights
  g.rect(-28, -2, 56, 1.5).fill({ color: 0x44aaff, alpha: 0.18 });
  g.rect(-1, -28, 1.5, 56).fill({ color: 0x44aaff, alpha: 0.18 });

  // Shoulder armour plates
  g.roundRect(-48, -12, 14, 20, 3).fill(0x2a3a4a);
  g.roundRect(-48, -12, 14, 20, 3).stroke({ color: 0x44aaff, width: 1 });
  g.roundRect(34, -12, 14, 20, 3).fill(0x2a3a4a);
  g.roundRect(34, -12, 14, 20, 3).stroke({ color: 0x44aaff, width: 1 });

  // Left eye socket
  g.poly([-24, -16, -8, -20, -8, -8, -24, -4]).fill(0x000000);
  // Left eye glow
  g.poly([-22, -14, -10, -17, -10, -9, -22, -6]).fill(0xcc1100);
  g.circle(-16, -11, 4).fill({ color: 0xff3311, alpha: 0.65 });
  g.circle(-16, -11, 1.5).fill(0xffffff);

  // Right eye socket
  g.poly([8, -20, 24, -16, 24, -4, 8, -8]).fill(0x000000);
  // Right eye glow
  g.poly([10, -17, 22, -14, 22, -6, 10, -9]).fill(0xcc1100);
  g.circle(16, -11, 4).fill({ color: 0xff3311, alpha: 0.65 });
  g.circle(16, -11, 1.5).fill(0xffffff);

  // Mechanical mouth / ventilation grille
  g.roundRect(-18, 8, 36, 9, 2).fill(0x111a22);
  for (let vi = 0; vi < 4; vi++) {
    g.rect(-15 + vi * 9, 10, 6, 5).fill({ color: 0x44aaff, alpha: 0.55 });
  }

  // Corner rivets / bolts
  const boltPos: Array<[number, number]> = [[-28, -28], [28, -28], [-28, 28], [28, 28]];
  for (const [bx, by] of boltPos) {
    g.circle(bx, by, 3).fill(0x3a5a7a);
    g.circle(bx, by, 1.2).fill(0x88bbcc);
  }

  // Antenna shaft
  g.rect(-1.5, -54, 3, 18).fill(0x3a5a7a);
  // Antenna tip with glowing sensor
  g.circle(0, -55, 5).fill(0x223344);
  g.circle(0, -55, 3).fill(0x44ffcc);
  g.circle(0, -55, 1.2).fill(0xffffff);

  c.addChild(g);
  return c;
}

// ─── Grandpa Turkey (祖父火雞) ──────────────────────────────────────────────────
/**
 * Wise elderly turkey character — the chicken's grandfather.
 * Origin at centre of face.
 */
export function createGrandpaTurkeyDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // ── Fan tail (behind body, drawn first) ─────────────────────────────────
  const fanCount = 11;
  for (let i = 0; i < fanCount; i++) {
    const angle = (i / (fanCount - 1)) * Math.PI - Math.PI * 0.15;
    const r = 56;
    // Alternate feather colours: warm brown / light tan
    const featherColor = i % 2 === 0 ? 0x8b4513 : 0xc8a060;
    g.moveTo(0, 4);
    const ex = -Math.cos(angle) * r;
    const ey = -Math.sin(angle) * r;
    // Feather as a thin ellipse rotated along the fan ray
    const mx = (-Math.cos(angle) * r * 0.5);
    const my = (-Math.sin(angle) * r * 0.5);
    g.ellipse(mx, my, 5, 26).fill({ color: featherColor, alpha: 0.85 });
    // Feather tip highlight
    g.ellipse(ex, ey, 4, 6).fill({ color: 0xffe0a0, alpha: 0.5 });
  }
  // Fan base arc
  g.arc(0, 4, 22, Math.PI * 1.15, Math.PI * 1.85).fill({ color: 0x6b3a10, alpha: 0.9 });

  // ── Body (round, grey-brown — old age) ───────────────────────────────────
  g.circle(0, 8, 34).fill(0x8a7060);
  g.circle(0, 8, 30).fill(0xb09070);
  // White chest patch (age plumage)
  g.ellipse(0, 16, 14, 12).fill({ color: 0xf0e8d8, alpha: 0.80 });

  // ── Head ─────────────────────────────────────────────────────────────────
  g.circle(0, -16, 22).fill(0xa07858);
  g.circle(0, -16, 18).fill(0xc09870);

  // ── Beak (hooked, dark) ──────────────────────────────────────────────────
  g.moveTo(16, -18).lineTo(28, -13).lineTo(20, -8).closePath().fill(0x5a3a10);
  // Beak lower jaw
  g.moveTo(16, -14).lineTo(24, -10).lineTo(16, -8).closePath().fill(0x7a5a20);

  // ── Wattle (red fleshy fold) ─────────────────────────────────────────────
  g.ellipse(14, -8, 5, 9).fill({ color: 0xdd2200, alpha: 0.85 });
  g.ellipse(10, -4, 4, 7).fill({ color: 0xff4422, alpha: 0.70 });

  // ── Snood (red bump above beak) ─────────────────────────────────────────
  g.ellipse(20, -22, 4, 8).fill({ color: 0xdd2200, alpha: 0.80 });

  // ── Wise thick eyebrows (grey/white, bushy) ──────────────────────────────
  g.moveTo(-22, -30).lineTo(-6, -34).lineTo(-5, -28).lineTo(-22, -25).closePath().fill(0xd8d0c0);
  g.moveTo(6, -34).lineTo(20, -30).lineTo(20, -25).lineTo(6, -28).closePath().fill(0xd8d0c0);

  // ── Eyes (warm amber — wise and gentle) ─────────────────────────────────
  g.circle(-12, -22, 7).fill(0xfff0d0);
  g.circle(-12, -22, 5).fill(0xc07800);
  g.circle(-12, -22, 2.5).fill(0x110000);
  g.circle(-10, -24, 1.2).fill(0xffffff);

  g.circle(10, -22, 7).fill(0xfff0d0);
  g.circle(10, -22, 5).fill(0xc07800);
  g.circle(10, -22, 2.5).fill(0x110000);
  g.circle(12, -24, 1.2).fill(0xffffff);

  // ── Glasses (round wire-frame) ───────────────────────────────────────────
  // Left lens
  g.circle(-12, -22, 8.5).stroke({ color: 0xaaaaaa, width: 1.5 });
  // Right lens
  g.circle(10, -22, 8.5).stroke({ color: 0xaaaaaa, width: 1.5 });
  // Bridge
  g.moveTo(-3, -22).lineTo(1, -22).stroke({ color: 0xaaaaaa, width: 1.5 });
  // Left arm
  g.moveTo(-21, -22).lineTo(-30, -19).stroke({ color: 0xaaaaaa, width: 1.5 });
  // Right arm
  g.moveTo(19, -22).lineTo(28, -19).stroke({ color: 0xaaaaaa, width: 1.5 });

  // ── Wrinkles (age lines) ─────────────────────────────────────────────────
  g.moveTo(-18, -10).lineTo(-10, -12).stroke({ color: 0x7a5a38, width: 1, alpha: 0.5 });
  g.moveTo(10, -12).lineTo(18, -10).stroke({ color: 0x7a5a38, width: 1, alpha: 0.5 });

  // ── Wise smile ───────────────────────────────────────────────────────────
  g.arc(0, -6, 10, 0.25, Math.PI - 0.25).stroke({ color: 0x5a3a10, width: 2 });

  // ── Walking cane ─────────────────────────────────────────────────────────
  // Shaft
  g.rect(28, -4, 4, 42).fill(0x6b3a10);
  // Handle (curved top — J shape)
  g.arc(24, -4, 8, Math.PI * 1.5, Math.PI * 0.5).stroke({ color: 0x6b3a10, width: 4 });
  // Cane tip metal
  g.circle(30, 38, 4).fill(0x888888);

  // ── Feet ─────────────────────────────────────────────────────────────────
  g.rect(-10, 38, 4, 10).fill(0x8b4513);
  g.rect(-16, 46, 14, 3).fill(0x8b4513);
  g.rect(4, 38, 4, 10).fill(0x8b4513);
  g.rect(1, 46, 14, 3).fill(0x8b4513);

  c.addChild(g);
  return c;
}

// ─── Bullet factories ────────────────────────────────────────────────────────
/** Player bullet: bright yellow circle with soft glow. */
export function createPlayerBullet(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 7).fill({ color: 0xffff88, alpha: 0.3 }); // glow
  g.circle(0, 0, 5).fill(0xffff44);
  return g;
}

/** Enemy bullet with given colour. */
export function createEnemyBullet(color: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 9).fill({ color, alpha: 0.25 }); // glow halo
  g.circle(0, 0, 6).fill(color);
  g.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.4 }); // core highlight
  return g;
}

// ─── Starfield ────────────────────────────────────────────────────────────────
/** Create a static starfield Container sized w×h. */
export function createStarfield(w: number, h: number): Container {
  const c = new Container();
  const g = new Graphics();

  // Background fill
  g.rect(0, 0, w, h).fill(0x000011);
  c.addChild(g);

  // Stars
  for (let i = 0; i < 120; i++) {
    const sg = new Graphics();
    const r = Math.random() * 1.5 + 0.5;
    const alpha = Math.random() * 0.6 + 0.25;
    sg.circle(0, 0, r).fill({ color: 0xffffff, alpha });
    sg.x = Math.random() * w;
    sg.y = Math.random() * h;
    c.addChild(sg);
  }

  return c;
}

// ─── Heart HP icon ────────────────────────────────────────────────────────────
/** Draw a simple heart using two arcs + a triangle. */
export function createHeart(filled: boolean): Graphics {
  const g = new Graphics();
  const col = filled ? 0xff2244 : 0x444444;
  // Two top circles
  g.circle(-5, -4, 6).fill(col);
  g.circle(5, -4, 6).fill(col);
  // Bottom triangle
  g.moveTo(-11, -2).lineTo(0, 12).lineTo(11, -2).closePath().fill(col);
  return g;
}

// ─── Black Hole (黑洞) ────────────────────────────────────────────────────────
/**
 * Build a Container for the Black Hole enemy (虛空之境 mode).
 * An imposing singularity with concentric event-horizon rings and an
 * accretion-disk glow.  Origin at centre.
 */
export function createBlackHoleDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer accretion-disk glow (wide, faint)
  g.circle(0, 0, 68).fill({ color: 0x220044, alpha: 0.10 });
  g.circle(0, 0, 60).fill({ color: 0x6600cc, alpha: 0.08 });

  // Accretion rings
  g.circle(0, 0, 54).stroke({ color: 0x9922ff, width: 3, alpha: 0.30 });
  g.circle(0, 0, 46).stroke({ color: 0x6600ff, width: 2, alpha: 0.35 });
  g.circle(0, 0, 38).stroke({ color: 0x4400cc, width: 1.5, alpha: 0.45 });

  // Event horizon (dark solid disc)
  g.circle(0, 0, 34).fill(0x000000);
  g.circle(0, 0, 34).stroke({ color: 0x8800ff, width: 3, alpha: 0.85 });

  // Inner void (perfectly black)
  g.circle(0, 0, 28).fill(0x000000);

  // Gravitational lensing shimmer (thin bright ring just inside horizon)
  g.circle(0, 0, 30).stroke({ color: 0xcc88ff, width: 1, alpha: 0.50 });
  g.circle(0, 0, 26).stroke({ color: 0x9933ff, width: 1, alpha: 0.35 });

  // Pulsing core highlight
  g.circle(0, 0, 10).fill({ color: 0x440066, alpha: 0.55 });
  g.circle(0, 0, 5).fill({ color: 0xaa44ff, alpha: 0.35 });

  // Four radial jet-streams (gravitational poles)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const cx = Math.cos(a) * 44;
    const cy = Math.sin(a) * 44;
    g.circle(cx, cy, 3.5).fill({ color: 0xaa44ff, alpha: 0.28 });
  }

  c.addChild(g);
  return c;
}

// ─── Boss HP bar ─────────────────────────────────────────────────────────────
export function createBossHpBar(w: number): { container: Container; fill: Graphics } {
  const container = new Container();

  // Background track
  const bg = new Graphics();
  bg.roundRect(0, 0, w, 18, 4).fill({ color: 0x330000, alpha: 0.8 });
  container.addChild(bg);

  // Fill bar
  const fill = new Graphics();
  fill.rect(0, 0, w, 18).fill(0xff2222);
  container.addChild(fill);

  // Border
  const border = new Graphics();
  border.roundRect(0, 0, w, 18, 4).stroke({ color: 0xff6666, width: 1.5 });
  container.addChild(border);

  return { container, fill };
}

// ─── Pickup items ─────────────────────────────────────────────────────────────
/** Health pickup: glowing green circle with a white heart inside. */
export function createHealthItem(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow
  g.circle(0, 0, 20).fill({ color: 0x00ff88, alpha: 0.22 });
  // Body
  g.circle(0, 0, 14).fill(0x00bb55);
  // White heart
  g.circle(-4, -3, 5).fill(0xffffff);
  g.circle(4, -3, 5).fill(0xffffff);
  g.moveTo(-9, -1).lineTo(0, 10).lineTo(9, -1).closePath().fill(0xffffff);

  c.addChild(g);
  return c;
}

/** Power pickup: glowing orange circle with a yellow star inside. */
export function createPowerItem(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow
  g.circle(0, 0, 20).fill({ color: 0xffcc00, alpha: 0.28 });
  // Body
  g.circle(0, 0, 14).fill(0xff8800);

  // 5-pointed star
  const n = 5;
  const outerR = 9;
  const innerR = 4;
  const starPoints: number[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    starPoints.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(starPoints).fill(0xffee44);

  c.addChild(g);
  return c;
}

/** Gift box pickup (麋鹿小雞 passive): a wrapped present that awards a random buff. */
export function createGiftBoxItem(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow (gold)
  g.circle(0, 0, 20).fill({ color: 0xffdd00, alpha: 0.25 });
  // Box body
  g.rect(-11, -4, 22, 14).fill(0xcc3300);
  // Box lid
  g.rect(-11, -13, 22, 10).fill(0xee4411);
  // Vertical ribbon
  g.rect(-3, -13, 6, 24).fill(0xffee00);
  // Horizontal ribbon
  g.rect(-11, -3, 22, 6).fill(0xffee00);
  // Bow left loop
  g.ellipse(-7, -16, 6, 4).fill(0xffee00);
  // Bow right loop
  g.ellipse(7, -16, 6, 4).fill(0xffee00);
  // Bow centre knot
  g.circle(0, -16, 3).fill(0xffd700);

  c.addChild(g);
  return c;
}

/** Wizard fireball projectile (魔法小雞 active): a large glowing orange-yellow sphere. */
export function createFireball(): Graphics {
  const g = new Graphics();
  // Wide outer halo
  g.circle(0, 0, 38).fill({ color: 0xff4400, alpha: 0.12 });
  // Mid glow
  g.circle(0, 0, 28).fill({ color: 0xff6600, alpha: 0.30 });
  // Core
  g.circle(0, 0, 20).fill(0xff8800);
  // Inner hot centre
  g.circle(0, 0, 12).fill(0xffcc00);
  // Bright centre
  g.circle(0, 0, 7).fill(0xffee88);
  // Highlight
  g.circle(-6, -7, 4).fill({ color: 0xffffff, alpha: 0.60 });
  return g;
}

// ─── Screen flash overlay ────────────────────────────────────────────────────
export function createFlashOverlay(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h).fill(0xffffff);
  g.alpha = 0;
  return g;
}

// ─── Trap Bubble ─────────────────────────────────────────────────────────────
/** Enemy trap bubble: translucent cyan sphere that slows the player on contact. */
export function createTrapBubble(color: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 20).fill({ color, alpha: 0.16 }); // outer glow
  g.circle(0, 0, 12).fill({ color, alpha: 0.40 }); // body
  g.circle(0, 0, 12).stroke({ color: 0xffffff, width: 1.5, alpha: 0.50 }); // rim
  g.circle(4, -4, 3).fill({ color: 0xffffff, alpha: 0.45 }); // highlight
  return g;
}

// ─── Trap Ring (player visual when trapped) ───────────────────────────────────
/** Pulsing cyan ring drawn around the player while they are trapped. Redrawn each frame. */
export function createTrapRing(): Graphics {
  const g = new Graphics();
  g.visible = false;
  return g;
}

// ─── Elegant Chicken (優雅小雞) ───────────────────────────────────────────────
/**
 * A graceful white-and-pink chicken with a ribbon and slender proportions.
 * Origin at centre of the body.
 */
export function createElegantChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.20 });

  // Left wing
  g.ellipse(-18, 6, 10, 7).fill(0xfff0f5);

  // Body
  g.circle(0, 0, 22).fill(0xffffff);

  // Belly highlight (soft pink)
  g.ellipse(4, 6, 11, 9).fill(0xffe0ee);

  // Comb (pink ribbon shape)
  g.moveTo(-6, -20).lineTo(-2, -32).lineTo(2, -20)
    .closePath().fill(0xff99cc);
  // Ribbon bow
  g.moveTo(-10, -22).lineTo(-2, -26).lineTo(-2, -18).closePath().fill(0xff66aa);
  g.moveTo(10, -22).lineTo(2, -26).lineTo(2, -18).closePath().fill(0xff66aa);
  g.circle(0, -22, 3).fill(0xff3388);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0xfff0f5);

  // Beak (small, pink)
  g.moveTo(18, -2).lineTo(26, 2).lineTo(18, 6).closePath().fill(0xffaacc);

  // Eye white
  g.circle(12, -7, 6).fill(0xffffff);
  // Pupil (blue)
  g.circle(13, -6, 3).fill(0x2244aa);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xffffff);
  // Eyelash (three small strokes above eye)
  g.moveTo(8, -13).lineTo(9, -16).lineTo(10, -13).fill(0x111111);
  g.moveTo(12, -14).lineTo(13, -17).lineTo(14, -14).fill(0x111111);
  g.moveTo(15, -13).lineTo(17, -16).lineTo(18, -13).fill(0x111111);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xffaacc);
  g.rect(-14, 31, 11, 3).fill(0xffaacc);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xffaacc);
  g.rect(3, 31, 11, 3).fill(0xffaacc);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Adventure Chicken (冒險小雞) ─────────────────────────────────────────────
/**
 * A rugged orange-brown chicken with a tiny explorer hat and scarf.
 * Origin at centre of the body.
 */
export function createAdventureChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.25 });

  // Left wing
  g.ellipse(-18, 6, 10, 7).fill(0xcc8800);

  // Body (earthy orange)
  g.circle(0, 0, 22).fill(0xdd8800);

  // Belly patch
  g.ellipse(4, 6, 11, 9).fill(0xeeaa44);

  // Explorer hat brim
  g.rect(-14, -24, 28, 5).fill(0x5c3a00);
  // Hat crown
  g.rect(-9, -38, 18, 16).fill(0x7a4e00);
  // Hat band
  g.rect(-9, -25, 18, 4).fill(0xcc7700);

  // Comb (under hat)
  g.moveTo(-4, -20).lineTo(0, -26).lineTo(4, -20).closePath().fill(0xff3333);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0xcc8800);

  // Scarf (two-tone wrap around neck)
  g.ellipse(4, 14, 14, 5).fill(0xdd3300);
  g.ellipse(4, 17, 10, 3).fill(0xff6644);

  // Beak
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xff8800);

  // Eye white
  g.circle(12, -7, 6).fill(0xffffff);
  // Pupil (determined green)
  g.circle(13, -6, 3).fill(0x225500);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xffffff);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xff8800);
  g.rect(-14, 31, 11, 3).fill(0xff8800);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xff8800);
  g.rect(3, 31, 11, 3).fill(0xff8800);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Hero Chicken (勇者小雞) ──────────────────────────────────────────────────
/**
 * A golden legendary chicken with a crown and radiant aura.
 * Origin at centre of the body.
 */
export function createHeroChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Radiant aura
  g.circle(0, 0, 30).fill({ color: 0xffdd00, alpha: 0.18 });
  g.circle(0, 0, 26).fill({ color: 0xffee88, alpha: 0.12 });

  // Shadow
  g.ellipse(0, 26, 20, 6).fill({ color: 0x000000, alpha: 0.22 });

  // Left wing (golden)
  g.ellipse(-19, 6, 11, 8).fill(0xffd700);

  // Body
  g.circle(0, 0, 22).fill(0xffd700);

  // Belly highlight
  g.ellipse(4, 6, 11, 9).fill(0xffee66);

  // Crown (five points)
  const crownX = [-10, -6, 0, 6, 10];
  const crownTipY = [-42, -48, -44, -48, -42];
  const crownBaseY = -28;
  for (let i = 0; i < 5; i++) {
    const x0 = i === 0 ? -10 : crownX[i - 1] + (crownX[i] - crownX[i - 1]) / 2;
    const x1 = crownX[i];
    const x2 = i === 4 ? 10 : crownX[i] + (crownX[i + 1] - crownX[i]) / 2;
    g.poly([x0, crownBaseY, x1, crownTipY[i], x2, crownBaseY]).fill(0xffd700);
  }
  // Crown band
  g.rect(-10, -28, 20, 6).fill(0xffcc00);
  // Crown jewels
  g.circle(-5, -25, 2).fill(0xff2244);
  g.circle(0, -25, 2).fill(0x44aaff);
  g.circle(5, -25, 2).fill(0x44ff88);

  // Comb (under crown, small)
  g.moveTo(-4, -20).lineTo(0, -26).lineTo(4, -20).closePath().fill(0xff3333);

  // Right wing
  g.ellipse(20, 6, 11, 8).fill(0xffd700);

  // Beak
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xff8800);

  // Eye white
  g.circle(12, -7, 6).fill(0xffffff);
  // Pupil (gold iris)
  g.circle(13, -6, 3).fill(0x884400);
  // Pupil shine
  g.circle(13, -6, 1.5).fill(0xffdd00);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xffffff);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xff8800);
  g.rect(-14, 31, 11, 3).fill(0xff8800);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xff8800);
  g.rect(3, 31, 11, 3).fill(0xff8800);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Boss Chicken (BOSS雞) ────────────────────────────────────────────────────
/**
 * A dark, menacing chicken with spiky accents and glowing red eyes —
 * the player character who has absorbed the power of every boss.
 * Origin at centre of the body.
 */
export function createBossChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Dark aura
  g.circle(0, 0, 34).fill({ color: 0x440000, alpha: 0.22 });
  g.circle(0, 0, 28).fill({ color: 0x880000, alpha: 0.14 });

  // Shadow
  g.ellipse(0, 26, 20, 6).fill({ color: 0x000000, alpha: 0.35 });

  // Left wing (dark)
  g.ellipse(-19, 6, 11, 8).fill(0x222222);

  // Body (dark charcoal)
  g.circle(0, 0, 22).fill(0x1a1a1a);

  // Body highlight (subtle purple sheen)
  g.ellipse(-5, -5, 14, 11).fill({ color: 0x660066, alpha: 0.28 });

  // Spiky comb (five sharp spikes)
  const spikeXs = [-10, -5, 0, 5, 10];
  const spikeTips = [-38, -44, -40, -44, -38];
  for (let i = 0; i < spikeXs.length; i++) {
    g.moveTo(spikeXs[i] - 3, -20)
      .lineTo(spikeXs[i], spikeTips[i])
      .lineTo(spikeXs[i] + 3, -20)
      .closePath().fill(0xcc0000);
  }

  // Right wing (dark)
  g.ellipse(20, 6, 11, 8).fill(0x222222);

  // Beak (dark red)
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xaa2200);

  // Eye glow
  g.circle(12, -7, 9).fill({ color: 0xff0000, alpha: 0.30 });
  // Eye white (red)
  g.circle(12, -7, 6).fill(0xdd0000);
  // Pupil (black)
  g.circle(13, -6, 3).fill(0x000000);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xff6666);

  // Left foot (dark)
  g.rect(-9, 22, 3, 10).fill(0x444444);
  g.rect(-14, 31, 11, 3).fill(0x444444);

  // Right foot (dark)
  g.rect(6, 22, 3, 10).fill(0x444444);
  g.rect(3, 31, 11, 3).fill(0x444444);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Moose Chicken (麋鹿小雞) ─────────────────────────────────────────────────
/**
 * A warm brown chicken sporting a pair of broad moose antlers and a kind face.
 * Origin at centre of the body.
 */
export function createMooseChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.25 });

  // Left wing
  g.ellipse(-18, 6, 10, 7).fill(0x8b5e3c);

  // Body (warm brown)
  g.circle(0, 0, 22).fill(0xa0632a);

  // Belly patch (lighter tan)
  g.ellipse(4, 6, 11, 9).fill(0xc8945a);

  // ── Antlers ──────────────────────────────────────────────────────────────
  // Left antler main beam
  g.moveTo(-6, -20).lineTo(-14, -44).lineTo(-10, -44).lineTo(-4, -22).closePath().fill(0x6b3a1f);
  // Left antler brow tine
  g.moveTo(-11, -34).lineTo(-20, -38).lineTo(-19, -35).lineTo(-10, -31).closePath().fill(0x6b3a1f);
  // Left antler bez tine
  g.moveTo(-13, -40).lineTo(-22, -46).lineTo(-21, -43).lineTo(-12, -37).closePath().fill(0x6b3a1f);

  // Right antler main beam
  g.moveTo(4, -20).lineTo(12, -44).lineTo(16, -44).lineTo(8, -22).closePath().fill(0x6b3a1f);
  // Right antler brow tine
  g.moveTo(9, -34).lineTo(18, -38).lineTo(17, -35).lineTo(8, -31).closePath().fill(0x6b3a1f);
  // Right antler bez tine
  g.moveTo(11, -40).lineTo(20, -46).lineTo(19, -43).lineTo(10, -37).closePath().fill(0x6b3a1f);

  // Comb (small red tuft between antler bases)
  g.moveTo(-4, -20).lineTo(0, -26).lineTo(4, -20).closePath().fill(0xff3333);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0x8b5e3c);

  // Beak
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xff8800);

  // Snout/muzzle (moose-style large muzzle, slightly protruding)
  g.ellipse(14, 2, 9, 7).fill(0xb87040);

  // Eye white
  g.circle(11, -7, 6).fill(0xffffff);
  // Pupil (warm dark brown)
  g.circle(12, -6, 3).fill(0x2a1200);
  // Eye glint
  g.circle(14, -8, 1.2).fill(0xffffff);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xff8800);
  g.rect(-14, 31, 11, 3).fill(0xff8800);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xff8800);
  g.rect(3, 31, 11, 3).fill(0xff8800);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Fox Chicken (狐狸小雞) ───────────────────────────────────────────────────
/**
 * An orange-and-white fox-styled chicken with triangular ears and a bushy tail.
 * Origin at centre of the body.
 */
export function createFoxChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.25 });

  // Fluffy tail (behind body, drawn first)
  g.ellipse(-28, 10, 13, 9).fill(0xff6a00);
  g.ellipse(-28, 10, 9, 6).fill(0xffddb0);
  // Tail tip
  g.circle(-38, 10, 7).fill(0xffffff);

  // Left wing (fox orange)
  g.ellipse(-18, 6, 10, 7).fill(0xe05800);

  // Body (vivid orange)
  g.circle(0, 0, 22).fill(0xff6a00);

  // White chest patch
  g.ellipse(3, 5, 12, 10).fill(0xffeedd);

  // Triangular fox ears
  // Left ear outer
  g.moveTo(-13, -20).lineTo(-18, -40).lineTo(-4, -26).closePath().fill(0xff6a00);
  // Left ear inner
  g.moveTo(-12, -22).lineTo(-16, -36).lineTo(-6, -27).closePath().fill(0xffaaaa);
  // Right ear outer
  g.moveTo(1, -22).lineTo(8, -42).lineTo(16, -24).closePath().fill(0xff6a00);
  // Right ear inner
  g.moveTo(3, -23).lineTo(8, -37).lineTo(14, -25).closePath().fill(0xffaaaa);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0xe05800);

  // Beak (dark orange)
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xcc5500);

  // Fox mask: white cheek patches
  g.ellipse(8, 0, 7, 6).fill(0xfff0e0);

  // Eye white
  g.circle(11, -7, 6).fill(0xffffff);
  // Iris (amber)
  g.circle(12, -6, 3.5).fill(0xdd8800);
  // Pupil (slit, approximated with tall ellipse)
  g.ellipse(12, -6, 1.5, 3).fill(0x110000);
  // Eye glint
  g.circle(14, -8, 1.2).fill(0xffffff);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xcc5500);
  g.rect(-14, 31, 11, 3).fill(0xcc5500);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xcc5500);
  g.rect(3, 31, 11, 3).fill(0xcc5500);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Wizard Chicken (魔法小雞) ────────────────────────────────────────────────
/**
 * A mystical purple chicken wearing a tall star-studded wizard hat with sparkles.
 * Origin at centre of the body.
 */
export function createWizardChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.25 });

  // Magical aura glow
  g.circle(0, 0, 28).fill({ color: 0x8833ff, alpha: 0.12 });

  // Left wing (purple)
  g.ellipse(-18, 6, 10, 7).fill(0x7722cc);

  // Body (deep purple)
  g.circle(0, 0, 22).fill(0x9933ff);

  // Robe/belly highlight (lighter violet)
  g.ellipse(4, 6, 11, 9).fill(0xbb77ff);

  // ── Wizard hat brim ───────────────────────────────────────────────────────
  g.ellipse(-1, -22, 18, 5).fill(0x330088);
  // Hat body (tall cone)
  g.moveTo(-16, -22).lineTo(-6, -58).lineTo(14, -58).lineTo(18, -22).closePath().fill(0x5500cc);
  // Hat highlight stripe
  g.moveTo(-3, -24).lineTo(-1, -55).lineTo(4, -55).lineTo(5, -24).closePath()
    .fill({ color: 0xaa66ff, alpha: 0.35 });
  // Hat tip curl
  g.circle(4, -58, 4).fill(0x5500cc);

  // Stars on hat
  // Star helper: small 4-point star as two overlapping rects approximated by polygons
  const drawStar = (sx: number, sy: number, r: number, col: number) => {
    g.moveTo(sx, sy - r)
      .lineTo(sx + r * 0.35, sy - r * 0.35)
      .lineTo(sx + r, sy)
      .lineTo(sx + r * 0.35, sy + r * 0.35)
      .lineTo(sx, sy + r)
      .lineTo(sx - r * 0.35, sy + r * 0.35)
      .lineTo(sx - r, sy)
      .lineTo(sx - r * 0.35, sy - r * 0.35)
      .closePath().fill(col);
  };
  drawStar(-4, -38, 5, 0xffee00);
  drawStar(7, -46, 4, 0xffffff);
  drawStar(-8, -50, 3, 0xffcc44);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0x7722cc);

  // Beak
  g.moveTo(18, -2).lineTo(28, 2).lineTo(18, 7).closePath().fill(0xff8800);

  // Eye white
  g.circle(11, -7, 6).fill(0xffffff);
  // Iris (bright violet)
  g.circle(12, -6, 3.5).fill(0xcc44ff);
  // Pupil
  g.circle(13, -5, 2).fill(0x110022);
  // Eye glint
  g.circle(14, -8, 1.2).fill(0xffffff);

  // Sparkle particles around body
  const sparks = [[-20, -8, 3], [20, -12, 2.5], [-14, 14, 2], [18, 10, 2], [0, -26, 2.5]];
  for (const [sx, sy, sr] of sparks) {
    g.star(sx, sy, 4, sr, sr * 0.4, 0).fill(0xffee00);
  }

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0x5500cc);
  g.rect(-14, 31, 11, 3).fill(0x5500cc);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0x5500cc);
  g.rect(3, 31, 11, 3).fill(0x5500cc);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Princess Chicken (公主小雞) ──────────────────────────────────────────────
/**
 * A regal pink chicken wearing a tiara with a flowing cape.
 * Origin at centre of the body.
 */
export function createPrincessChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Royal aura
  g.circle(0, 0, 30).fill({ color: 0xff66cc, alpha: 0.12 });

  // Shadow
  g.ellipse(0, 26, 18, 5).fill({ color: 0x000000, alpha: 0.20 });

  // Cape (drawn behind body)
  g.moveTo(-22, 2).lineTo(-28, 28).lineTo(28, 28).lineTo(22, 2).closePath()
    .fill({ color: 0xcc44aa, alpha: 0.90 });
  // Cape inner lining
  g.moveTo(-18, 4).lineTo(-22, 26).lineTo(22, 26).lineTo(18, 4).closePath()
    .fill({ color: 0xff99dd, alpha: 0.60 });

  // Left wing
  g.ellipse(-18, 6, 10, 7).fill(0xffccee);

  // Body (bright pink)
  g.circle(0, 0, 22).fill(0xff88bb);

  // Belly highlight
  g.ellipse(4, 6, 11, 9).fill(0xffccee);

  // Tiara base band
  g.rect(-12, -22, 24, 5).fill(0xffd700);
  // Tiara centre gem (ruby)
  g.circle(0, -26, 5).fill(0xff2244);
  g.circle(0, -26, 3).fill({ color: 0xffffff, alpha: 0.55 });
  // Tiara side gems
  g.circle(-7, -24, 3).fill(0xffd700);
  g.circle(7, -24, 3).fill(0xffd700);

  // Comb (small, pink tufts under tiara)
  g.moveTo(-4, -18).lineTo(0, -24).lineTo(4, -18).closePath().fill(0xff4488);

  // Right wing
  g.ellipse(19, 6, 10, 7).fill(0xffccee);

  // Beak (soft pink)
  g.moveTo(18, -2).lineTo(27, 2).lineTo(18, 7).closePath().fill(0xffaacc);

  // Eye white
  g.circle(12, -7, 6).fill(0xffffff);
  // Iris (violet)
  g.circle(13, -6, 3.5).fill(0x8833cc);
  // Pupil
  g.circle(13, -6, 1.8).fill(0x110022);
  // Eye glint
  g.circle(15, -8, 1.2).fill(0xffffff);
  // Lashes
  g.moveTo(8, -12).lineTo(9, -15).lineTo(10, -12).fill(0x111111);
  g.moveTo(12, -13).lineTo(13, -16).lineTo(14, -13).fill(0x111111);
  g.moveTo(16, -12).lineTo(17, -15).lineTo(18, -12).fill(0x111111);

  // Left foot
  g.rect(-9, 22, 3, 10).fill(0xffaacc);
  g.rect(-14, 31, 11, 3).fill(0xffaacc);

  // Right foot
  g.rect(6, 22, 3, 10).fill(0xffaacc);
  g.rect(3, 31, 11, 3).fill(0xffaacc);

  // Hitbox dot
  g.circle(0, 0, 3).fill({ color: 0xff0000, alpha: 0.75 });

  c.addChild(g);
  return c;
}

// ─── Guard Chicken (護衛小雞) ─────────────────────────────────────────────────
/**
 * A small pink bodyguard chicken summoned by the princess active ability.
 * Scaled-down and simpler than the main princess sprite.
 * Origin at centre of the body.
 */
export function createGuardChickenDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Tiny aura
  g.circle(0, 0, 18).fill({ color: 0xff88cc, alpha: 0.15 });

  // Body (light pink, smaller)
  g.circle(0, 0, 14).fill(0xffaad4);

  // Belly
  g.ellipse(2, 4, 7, 6).fill(0xffdde9);

  // Mini tiara
  g.rect(-7, -13, 14, 3).fill(0xffd700);
  g.circle(0, -15, 3).fill(0xff2244);

  // Wings
  g.ellipse(-11, 3, 6, 4).fill(0xffbbdd);
  g.ellipse(11, 3, 6, 4).fill(0xffbbdd);

  // Beak
  g.moveTo(11, -1).lineTo(17, 1).lineTo(11, 4).closePath().fill(0xffaacc);

  // Eye
  g.circle(7, -4, 4).fill(0xffffff);
  g.circle(8, -3, 2.2).fill(0x8833cc);
  g.circle(8, -3, 1).fill(0x110022);
  g.circle(9, -4, 0.8).fill(0xffffff);

  // Feet
  g.rect(-5, 14, 2, 6).fill(0xffaacc);
  g.rect(-8, 19, 7, 2).fill(0xffaacc);
  g.rect(4, 14, 2, 6).fill(0xffaacc);
  g.rect(2, 19, 7, 2).fill(0xffaacc);

  c.addChild(g);
  return c;
}

// ─── Player chicken factory ───────────────────────────────────────────────────
/**
 * Returns the correct player chicken Container for the given costume ID.
 * Falls back to the default chicken if the ID is unrecognised.
 */
export function createPlayerChicken(costume: CostumeId): Container {
  switch (costume) {
    case 'elegant':   return createElegantChickenDisplay();
    case 'moose':     return createMooseChickenDisplay();
    case 'fox':       return createFoxChickenDisplay();
    case 'wizard':    return createWizardChickenDisplay();
    case 'adventure': return createAdventureChickenDisplay();
    case 'hero':      return createHeroChickenDisplay();
    case 'boss':      return createBossChickenDisplay();
    case 'princess':  return createPrincessChickenDisplay();
    default:          return createChickenDisplay();
  }
}

// ─── Storm Boss (暴風魔) ───────────────────────────────────────────────────────
/**
 * Build a Container for the Storm boss.
 * A crackling black sphere wreathed in violet lightning arcs.
 * Origin at centre.
 */
export function createStormDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer electric aura
  g.circle(0, 0, 62).fill({ color: 0x330055, alpha: 0.10 });
  g.circle(0, 0, 54).fill({ color: 0x8800cc, alpha: 0.08 });

  // Lightning arc halo (8-point star, sharp spikes)
  const arcs = 8;
  const arcOuter = 52;
  const arcInner = 38;
  const arcPts: number[] = [];
  for (let i = 0; i < arcs * 2; i++) {
    const r = i % 2 === 0 ? arcOuter : arcInner;
    const a = (i / (arcs * 2)) * Math.PI * 2 - Math.PI / 2;
    arcPts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(arcPts).fill({ color: 0x7700bb, alpha: 0.35 });

  // Main body – deep black with a faint violet tint
  g.circle(0, 0, 44).fill(0x0a000f);
  g.circle(0, 0, 40).fill(0x14001f);

  // Inner swirling energy gradient
  g.ellipse(8, -6, 20, 16).fill({ color: 0x8800cc, alpha: 0.22 });
  g.ellipse(-10, 8, 16, 12).fill({ color: 0x5500aa, alpha: 0.18 });

  // Lightning bolts (4 jagged streaks)
  const boltDefs: Array<[number, number, number]> = [
    [-14, -30, -30],   // angle ~ up-left
    [14, -30, 30],     // up-right
    [-26, 5, 90],      // left
    [26, 5, -90],      // right
  ];
  for (const [bx, by, rot] of boltDefs) {
    const radRot = (rot * Math.PI) / 180;
    // Jagged bolt – 5 points zigzag
    const bw = 3, bh = 18;
    const pts = [
      bx, by,
      bx + Math.cos(radRot + Math.PI / 2) * bw + Math.cos(radRot) * (bh * 0.33),
      by + Math.sin(radRot + Math.PI / 2) * bw + Math.sin(radRot) * (bh * 0.33),
      bx - Math.cos(radRot + Math.PI / 2) * bw * 0.5 + Math.cos(radRot) * (bh * 0.66),
      by - Math.sin(radRot + Math.PI / 2) * bw * 0.5 + Math.sin(radRot) * (bh * 0.66),
      bx + Math.cos(radRot) * bh,
      by + Math.sin(radRot) * bh,
    ];
    g.poly(pts).fill({ color: 0xdd88ff, alpha: 0.70 });
  }

  // Central core – bright electric nucleus
  g.circle(0, 0, 14).fill({ color: 0xaa44ff, alpha: 0.55 });
  g.circle(0, 0, 9).fill(0x220033);
  g.circle(0, 0, 5).fill({ color: 0xee99ff, alpha: 0.80 });
  g.circle(0, 0, 2).fill(0xffffff);

  // Glowing eyes (two horizontal slits)
  g.ellipse(-11, -6, 8, 4).fill({ color: 0xffffff, alpha: 0.15 });
  g.ellipse(-11, -6, 5, 2.5).fill(0xffeecc);
  g.ellipse(-11, -6, 2.5, 1.5).fill(0x110022);
  g.ellipse(11, -6, 8, 4).fill({ color: 0xffffff, alpha: 0.15 });
  g.ellipse(11, -6, 5, 2.5).fill(0xffeecc);
  g.ellipse(11, -6, 2.5, 1.5).fill(0x110022);

  // Outer ring sparks (6 dots)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.circle(Math.cos(a) * 48, Math.sin(a) * 48, 3).fill({ color: 0xee66ff, alpha: 0.55 });
  }

  c.addChild(g);
  return c;
}

// ─── Dragon Boss (龍王) ────────────────────────────────────────────────────────
/**
 * Build a Container for the Dragon boss.
 * An imposing dragon head with curved horns, golden scales, and slit red eyes.
 * Origin at centre.
 */
export function createDragonDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer aura (deep red-gold glow)
  g.circle(0, 0, 66).fill({ color: 0x440000, alpha: 0.10 });
  g.circle(0, 0, 58).fill({ color: 0xff4400, alpha: 0.07 });

  // Crown spikes (5 spines)
  const crownSpikes = 5;
  for (let i = 0; i < crownSpikes; i++) {
    const t = (i / (crownSpikes - 1)) - 0.5;
    const bx = t * 46;
    const by = -40;
    const tipY = by - 20 - Math.abs(t) * 10;
    g.poly([bx - 6, by, bx, tipY, bx + 6, by]).fill(0xcc2200);
    g.poly([bx - 6, by, bx, tipY, bx + 6, by]).stroke({ color: 0xff8800, width: 1, alpha: 0.6 });
  }

  // Main head shape (hexagonal plate)
  g.poly([
    -44, 10,
    -36, -38,
    -16, -46,
    16, -46,
    36, -38,
    44, 10,
    28, 28,
    0, 34,
    -28, 28,
  ]).fill(0x6b0000);

  // Scale-plate overlay (lighter inner face)
  g.poly([
    -34, 8,
    -26, -32,
    -10, -40,
    10, -40,
    26, -32,
    34, 8,
    20, 22,
    0, 28,
    -20, 22,
  ]).fill(0x8b1500);

  // Golden scale highlights (diamond grid)
  const scalePositions: Array<[number, number]> = [
    [-14, -22], [0, -28], [14, -22],
    [-20, -8],  [0, -10], [20, -8],
    [-12, 6],   [0, 8],   [12, 6],
  ];
  for (const [sx, sy] of scalePositions) {
    g.poly([sx, sy - 7, sx + 6, sy, sx, sy + 5, sx - 6, sy]).fill({ color: 0xffcc00, alpha: 0.30 });
  }

  // Left horn (curved, thick at base)
  g.poly([-32, -34, -52, -62, -44, -68, -26, -38, -18, -34]).fill(0xff6600);
  g.poly([-32, -34, -52, -62, -44, -68, -26, -38, -18, -34]).stroke({ color: 0xffcc00, width: 1, alpha: 0.5 });
  // Right horn
  g.poly([32, -34, 52, -62, 44, -68, 26, -38, 18, -34]).fill(0xff6600);
  g.poly([32, -34, 52, -62, 44, -68, 26, -38, 18, -34]).stroke({ color: 0xffcc00, width: 1, alpha: 0.5 });

  // Brow ridges (angry)
  g.poly([-36, -22, -18, -32, -14, -26, -32, -16]).fill(0x550000);
  g.poly([36, -22, 18, -32, 14, -26, 32, -16]).fill(0x550000);

  // Left eye socket
  g.ellipse(-18, -14, 14, 9).fill(0x220000);
  // Left eye glow
  g.ellipse(-18, -14, 11, 7).fill({ color: 0xff4400, alpha: 0.60 });
  // Left eye slit pupil
  g.ellipse(-18, -14, 4, 8).fill(0xff8800);
  g.ellipse(-18, -14, 2, 5).fill(0x000000);
  g.circle(-15, -17, 2).fill(0xffffff);

  // Right eye socket
  g.ellipse(18, -14, 14, 9).fill(0x220000);
  // Right eye glow
  g.ellipse(18, -14, 11, 7).fill({ color: 0xff4400, alpha: 0.60 });
  // Right eye slit pupil
  g.ellipse(18, -14, 4, 8).fill(0xff8800);
  g.ellipse(18, -14, 2, 5).fill(0x000000);
  g.circle(21, -17, 2).fill(0xffffff);

  // Nostrils
  g.ellipse(-8, 10, 4, 3).fill({ color: 0xcc0000, alpha: 0.7 });
  g.ellipse(8, 10, 4, 3).fill({ color: 0xcc0000, alpha: 0.7 });

  // Maw / fang outline
  g.poly([-22, 16, -14, 12, -6, 18, 0, 12, 6, 18, 14, 12, 22, 16, 20, 28, 0, 32, -20, 28]).fill(0x110000);
  // Fangs (two white triangles)
  g.poly([-12, 16, -8, 22, -4, 16]).fill(0xeeeecc);
  g.poly([4, 16, 8, 22, 12, 16]).fill(0xeeeecc);

  // Chin flame glow
  g.ellipse(0, 28, 18, 8).fill({ color: 0xff4400, alpha: 0.25 });

  c.addChild(g);
  return c;
}

// ─── Dragon Eye Pet (龍眼護衛) ────────────────────────────────────────────────
/**
 * A compact floating dragon eye — used as the Level 8 pet guardian.
 * Smaller than the dragon boss; origin at centre.
 */
export function createDragonEyeDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow
  g.circle(0, 0, 28).fill({ color: 0xcc2200, alpha: 0.14 });

  // Wing-like flame petals
  g.ellipse(-20, 4, 12, 6).fill({ color: 0xaa2200, alpha: 0.88 });
  g.ellipse(20, 4, 12, 6).fill({ color: 0xaa2200, alpha: 0.88 });

  // Body outer ring
  g.circle(0, 0, 18).fill(0x200400);
  // Body inner
  g.circle(0, 0, 14).fill(0x3c0800);
  // Swirl highlight
  g.ellipse(5, -3, 7, 5).fill({ color: 0xff4400, alpha: 0.30 });

  // Central slit eye
  g.circle(0, 0, 10).fill({ color: 0xff6600, alpha: 0.55 });
  g.ellipse(0, 0, 4, 9).fill(0xff8800);
  g.ellipse(0, 0, 2, 5).fill(0x000000);
  g.circle(2, -2, 1.5).fill(0xffffff);

  // Flame corona dots
  const flameDots: Array<[number, number]> = [[-16, -6], [16, -6], [-13, 10], [13, 10], [0, -17]];
  for (const [fx, fy] of flameDots) {
    g.circle(fx, fy, 3).fill({ color: 0xff8800, alpha: 0.50 });
  }

  // Tiny jagged maw
  g.poly([-7, 12, -4, 9, -1, 12, 2, 9, 5, 12, 7, 9, 7, 14, -7, 14]).fill(0x110000);

  c.addChild(g);
  return c;
}
