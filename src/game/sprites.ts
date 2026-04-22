import { Container, Graphics } from 'pixi.js';

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
/** Returns a full-red circle to layer over the courage sprite on hit. */
export function createCourageHitFlash(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 44).fill({ color: 0xffffff, alpha: 0.6 });
  g.visible = false;
  return g;
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

// ─── Screen flash overlay ────────────────────────────────────────────────────
export function createFlashOverlay(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h).fill(0xffffff);
  g.alpha = 0;
  return g;
}
