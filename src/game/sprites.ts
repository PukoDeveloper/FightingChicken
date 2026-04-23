import { Container, Graphics } from 'pixi.js';
import type { EnemyType } from '../constants';

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

// ─── Courage Boss (勇氣) ──────────────────────────────────────────────────────
/**
 * Build a Container for the Courage boss character.
 * Origin at centre of face.
 */
export function createCourageDisplay(): Container {
  const c = new Container();
  const g = new Graphics();

  // Outer glow ring
  g.circle(0, 0, 58).fill({ color: 0x9900cc, alpha: 0.18 });
  g.circle(0, 0, 52).fill({ color: 0xdd00ff, alpha: 0.12 });

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

// ─── Enemy factory ────────────────────────────────────────────────────────────

/** Create the correct enemy display Container for the given enemy type. */
export function createEnemyDisplay(type: EnemyType): Container {
  switch (type) {
    case 'phantom': return createPhantomDisplay();
    case 'chaos':   return createChaosDisplay();
    default:        return createCourageDisplay();
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
  g.circle(0, 0, 58).fill({ color: 0x2244cc, alpha: 0.14 });
  g.circle(0, 0, 50).fill({ color: 0x4466ff, alpha: 0.10 });

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
  g.circle(0, 0, 62).fill({ color: 0x660000, alpha: 0.16 });
  g.circle(0, 0, 54).fill({ color: 0xcc00cc, alpha: 0.10 });

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
