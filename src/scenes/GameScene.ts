import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import type { Entity } from '@inkshot/engine';
import {
  createChickenDisplay,
  createCourageDisplay,
  createCourageHitFlash,
  createPlayerBullet,
  createEnemyBullet,
  createStarfield,
  createHeart,
  createBossHpBar,
  createFlashOverlay,
} from '../game/sprites';
import {
  PLAYER_HP_MAX,
  PLAYER_HITBOX_R,
  PLAYER_BULLET_SPEED,
  PLAYER_FIRE_INTERVAL,
  PLAYER_BULLET_R,
  INVINCIBLE_MS,
  ENEMY_HP_MAX,
  ENEMY_HITBOX_R,
  BULLET_SPEED_SLOW,
  BULLET_SPEED_MEDIUM,
  BULLET_SPEED_FAST,
  ENEMY_BULLET_R,
  PHASE2_FRAC,
  PHASE3_FRAC,
  SCORE_PER_HIT,
  SCORE_BONUS_WIN,
  COL_BULLET_P1,
  COL_BULLET_P2,
  COL_BULLET_P3,
  COL_BULLET_RING,
} from '../constants';
import { gameResult } from '../game/store';

// ─── Bullet data ─────────────────────────────────────────────────────────────
interface BulletData {
  display: Graphics;
  x: number;
  y: number;
  vx: number; // px/s
  vy: number; // px/s
}

// ─── Module-level cleanup handle ────────────────────────────────────────────
let _cleanup: (() => void) | null = null;

// ─── Convert clientX/Y to canvas coordinates ─────────────────────────────────
function toCanvas(clientX: number, clientY: number, core: Core): { x: number; y: number } {
  const canvas = core.app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * core.app.screen.width,
    y: ((clientY - rect.top) / rect.height) * core.app.screen.height,
  };
}

// ─── Scene enter ─────────────────────────────────────────────────────────────
async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Layers ──────────────────────────────────────────────────────────────
  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;
  const { output: sysOut } = core.events.emitSync('renderer/layer', { name: 'system' });
  const sysLayer = sysOut.layer as Container;

  // ── Background ───────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Scrolling starfield containers (two rows for looping) ────────────────
  const scrollA = createStarfield(W, H);
  const scrollB = createStarfield(W, H);
  scrollB.y = -H;
  worldLayer.addChild(scrollA, scrollB);
  let scrollY = 0;

  // ── Bullet containers ────────────────────────────────────────────────────
  const playerBulletsContainer = new Container();
  const enemyBulletsContainer = new Container();
  worldLayer.addChild(enemyBulletsContainer, playerBulletsContainer);

  // ── Player entity ────────────────────────────────────────────────────────
  const chickenDisplay = createChickenDisplay();
  const { output: playerOut } = await core.events.emit('entity/create', {
    id: 'player',
    tags: ['player'],
    position: { x: W * 0.5, y: H * 0.82 },
    display: chickenDisplay,
  });
  const playerEntity = playerOut.entity as Entity;

  // ── Enemy entity ─────────────────────────────────────────────────────────
  const courageDisplay = createCourageDisplay();
  const courageHitFlash = createCourageHitFlash();
  courageDisplay.addChild(courageHitFlash);

  const { output: enemyOut } = await core.events.emit('entity/create', {
    id: 'enemy',
    tags: ['enemy'],
    position: { x: W * 0.5, y: H * 0.18 },
    display: courageDisplay,
  });
  const enemyEntity = enemyOut.entity as Entity;

  // ── Bullet arrays ────────────────────────────────────────────────────────
  const playerBullets: BulletData[] = [];
  const enemyBullets: BulletData[] = [];

  // ── Game state ───────────────────────────────────────────────────────────
  let playerHP = PLAYER_HP_MAX;
  let enemyHP = ENEMY_HP_MAX;
  let score = 0;
  let phase: 1 | 2 | 3 = 1;
  let invincibleMs = 0;
  let gameEnded = false;

  // Timers (ms counters ticked down each update)
  let playerFireTimer = 0;
  let spiralTimer = 0;
  let aimTimer = 0;
  let spreadTimer = 0;
  let ringTimer = 0;
  let spiralAngle = 0;
  let enemyBobTimer = 0;
  let hitFlashTimer = 0;
  let phaseFlashTimer = 0;

  // Touch tracking
  let touchActive = false;
  let touchTargetX = playerEntity.position.x;
  let touchTargetY = playerEntity.position.y;

  // ── HUD ──────────────────────────────────────────────────────────────────
  // HP hearts
  const heartsContainer = new Container();
  const hearts: Graphics[] = [];
  for (let i = 0; i < PLAYER_HP_MAX; i++) {
    const h = createHeart(true);
    h.scale.set(1.1);
    h.x = 18 + i * 26;
    h.y = 24;
    heartsContainer.addChild(h);
    hearts.push(h);
  }
  uiLayer.addChild(heartsContainer);

  // Boss HP bar
  const BAR_W = W * 0.72;
  const { container: hpBarContainer, fill: hpBarFill } = createBossHpBar(BAR_W);
  hpBarContainer.x = (W - BAR_W) / 2;
  hpBarContainer.y = 8;
  uiLayer.addChild(hpBarContainer);

  const bossLabelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 13,
    fill: 0xffcccc,
    fontWeight: 'bold',
  });
  const bossLabel = new Text({ text: '勇氣  HP', style: bossLabelStyle });
  bossLabel.anchor.set(0.5);
  bossLabel.x = W * 0.5;
  bossLabel.y = 35;
  uiLayer.addChild(bossLabel);

  // Score text
  const scoreStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 18,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  const scoreText = new Text({ text: 'SCORE: 0', style: scoreStyle });
  scoreText.anchor.set(1, 0);
  scoreText.x = W - 10;
  scoreText.y = 10;
  uiLayer.addChild(scoreText);

  // Phase text
  const phaseStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xff8888,
  });
  const phaseText = new Text({ text: 'PHASE 1', style: phaseStyle });
  phaseText.anchor.set(0.5);
  phaseText.x = W * 0.5;
  phaseText.y = 48;
  uiLayer.addChild(phaseText);

  // Flash overlay (for phase transitions & hits)
  const flashOverlay = createFlashOverlay(W, H);
  sysLayer.addChild(flashOverlay);

  // ── Helper: spawn enemy bullet ────────────────────────────────────────────
  function spawnEnemyBullet(
    x: number, y: number,
    vx: number, vy: number,
    color: number
  ): void {
    const display = createEnemyBullet(color);
    display.x = x;
    display.y = y;
    enemyBulletsContainer.addChild(display);
    enemyBullets.push({ display, x, y, vx, vy });
  }

  // ── Helper: spawn player bullet ───────────────────────────────────────────
  function spawnPlayerBullet(x: number, y: number): void {
    const display = createPlayerBullet();
    display.x = x;
    display.y = y;
    playerBulletsContainer.addChild(display);
    playerBullets.push({ display, x, y, vx: 0, vy: -PLAYER_BULLET_SPEED });
  }

  // ── Helper: remove bullet ─────────────────────────────────────────────────
  function removeBullet(arr: BulletData[], idx: number, container: Container): void {
    const b = arr[idx];
    container.removeChild(b.display);
    b.display.destroy();
    arr.splice(idx, 1);
  }

  // ── Helper: update HUD ────────────────────────────────────────────────────
  function updateHUD(): void {
    // Hearts
    for (let i = 0; i < PLAYER_HP_MAX; i++) {
      const filled = i < playerHP;
      hearts[i].clear();
      const col = filled ? 0xff2244 : 0x444444;
      hearts[i].circle(-5, -4, 6).fill(col);
      hearts[i].circle(5, -4, 6).fill(col);
      hearts[i].moveTo(-11, -2).lineTo(0, 12).lineTo(11, -2).closePath().fill(col);
    }

    // Boss HP bar
    const frac = Math.max(0, enemyHP / ENEMY_HP_MAX);
    hpBarFill.clear();
    if (frac > 0) {
      const barColor = frac > PHASE2_FRAC ? 0xff2222
        : frac > PHASE3_FRAC ? 0xff8800 : 0xaa00ff;
      hpBarFill.rect(0, 0, BAR_W * frac, 18).fill(barColor);
    }

    // Score
    scoreText.text = `SCORE: ${score}`;
    phaseText.text = `PHASE ${phase}`;
  }

  // ── Helper: check phase ───────────────────────────────────────────────────
  function checkPhase(): void {
    const frac = enemyHP / ENEMY_HP_MAX;
    const newPhase: 1 | 2 | 3 = frac > PHASE2_FRAC ? 1 : frac > PHASE3_FRAC ? 2 : 3;
    if (newPhase !== phase) {
      phase = newPhase;
      // Trigger phase flash
      phaseFlashTimer = 600;
      // Clear bullets for brief pause
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(enemyBullets[i].display);
        enemyBullets[i].display.destroy();
      }
      enemyBullets.length = 0;
    }
  }

  // ── Bullet patterns ────────────────────────────────────────────────────────

  /** Spiral: fires nWay bullets spread evenly around spiralAngle */
  function fireSpiral(nWay: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    for (let i = 0; i < nWay; i++) {
      const a = ((spiralAngle + (i * 360) / nWay) * Math.PI) / 180;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
    spiralAngle = (spiralAngle + 13) % 360;
  }

  /** Aimed: fires nWay bullets toward player with spread */
  function fireAimed(nWay: number, spreadRad: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - ey, px - ex);
    const half = (nWay - 1) / 2;
    for (let i = 0; i < nWay; i++) {
      const a = baseAngle + (i - half) * spreadRad;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  /** Ring: fires n bullets in a full circle */
  function fireRing(n: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  // ── Touch input ────────────────────────────────────────────────────────────
  const unsubTouchStart = core.events.on(
    'game',
    'input/touch:start',
    ({ x, y }: { x: number; y: number }) => {
      const pos = toCanvas(x, y, core);
      touchActive = true;
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubTouchMove = core.events.on(
    'game',
    'input/touch:move',
    ({ x, y }: { x: number; y: number }) => {
      if (!touchActive) return;
      const pos = toCanvas(x, y, core);
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubTouchEnd = core.events.on('game', 'input/touch:end', () => {
    touchActive = false;
  });

  // Pointer (mouse) support for desktop testing
  const unsubPointerDown = core.events.on(
    'game',
    'input/pointer:down',
    ({ x, y }: { x: number; y: number }) => {
      const pos = toCanvas(x, y, core);
      touchActive = true;
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubPointerMove = core.events.on(
    'game',
    'input/pointer:move',
    ({ x, y }: { x: number; y: number }) => {
      if (!touchActive) return;
      const pos = toCanvas(x, y, core);
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubPointerUp = core.events.on('game', 'input/pointer:up', () => {
    touchActive = false;
  });

  // ── Main game update ────────────────────────────────────────────────────────
  const unsubUpdate = core.events.on(
    'game',
    'core/update',
    ({ dt }: { dt: number }) => {
      if (gameEnded) return;

      // ── Scroll starfield ──────────────────────────────────────────────────
      scrollY += 40 * (dt / 1000);
      if (scrollY >= H) scrollY -= H;
      scrollA.y = scrollY;
      scrollB.y = scrollY - H;

      // ── Player movement toward touch target ───────────────────────────────
      if (touchActive) {
        const targetX = Math.max(20, Math.min(W - 20, touchTargetX));
        const targetY = Math.max(60, Math.min(H - 40, touchTargetY - 80));
        const dx = targetX - playerEntity.position.x;
        const dy = targetY - playerEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxMove = 320 * (dt / 1000);
        if (dist < maxMove) {
          playerEntity.position.x = targetX;
          playerEntity.position.y = targetY;
        } else {
          playerEntity.position.x += (dx / dist) * maxMove;
          playerEntity.position.y += (dy / dist) * maxMove;
        }
      }

      // ── Enemy bobbing animation ───────────────────────────────────────────
      enemyBobTimer += dt;
      enemyEntity.position.y = H * 0.18 + Math.sin(enemyBobTimer / 800) * 12;

      // ── Phase flash ───────────────────────────────────────────────────────
      if (phaseFlashTimer > 0) {
        phaseFlashTimer -= dt;
        flashOverlay.alpha = Math.max(0, phaseFlashTimer / 600) * 0.5;
        const flashCol = phase === 2 ? 0xff8800 : 0xcc00ff;
        flashOverlay.clear().rect(0, 0, W, H).fill({ color: flashCol, alpha: 1 });
        if (phaseFlashTimer <= 0) flashOverlay.alpha = 0;
      }

      // ── Invincibility & blink ─────────────────────────────────────────────
      if (invincibleMs > 0) {
        invincibleMs -= dt;
        playerEntity.display.alpha = Math.floor(invincibleMs / 120) % 2 === 0 ? 0.35 : 1;
        if (invincibleMs <= 0) playerEntity.display.alpha = 1;
      }

      // ── Hit flash on enemy ────────────────────────────────────────────────
      if (hitFlashTimer > 0) {
        hitFlashTimer -= dt;
        courageHitFlash.visible = true;
        courageHitFlash.alpha = hitFlashTimer / 80;
        if (hitFlashTimer <= 0) {
          courageHitFlash.visible = false;
          hitFlashTimer = 0;
        }
      }

      // ── Player auto-fire ──────────────────────────────────────────────────
      playerFireTimer -= dt;
      if (playerFireTimer <= 0) {
        playerFireTimer = PLAYER_FIRE_INTERVAL;
        spawnPlayerBullet(playerEntity.position.x - 6, playerEntity.position.y - 18);
        spawnPlayerBullet(playerEntity.position.x + 6, playerEntity.position.y - 18);
      }

      // ── Enemy bullet patterns ─────────────────────────────────────────────
      if (phaseFlashTimer <= 0) {
        if (phase === 1) {
          // Slow spiral (5-way)
          spiralTimer -= dt;
          if (spiralTimer <= 0) {
            spiralTimer = 240;
            fireSpiral(5, BULLET_SPEED_SLOW, COL_BULLET_P1);
          }
          // Aimed double shot
          aimTimer -= dt;
          if (aimTimer <= 0) {
            aimTimer = 1400;
            fireAimed(2, 0.25, BULLET_SPEED_MEDIUM, COL_BULLET_P1);
          }
        } else if (phase === 2) {
          // Medium spiral (8-way)
          spiralTimer -= dt;
          if (spiralTimer <= 0) {
            spiralTimer = 180;
            fireSpiral(8, BULLET_SPEED_MEDIUM, COL_BULLET_P2);
          }
          // Wider aimed spread
          aimTimer -= dt;
          if (aimTimer <= 0) {
            aimTimer = 900;
            fireAimed(3, 0.3, BULLET_SPEED_MEDIUM, COL_BULLET_P2);
          }
          // Fan spread
          spreadTimer -= dt;
          if (spreadTimer <= 0) {
            spreadTimer = 1600;
            fireAimed(5, 0.22, BULLET_SPEED_SLOW, COL_BULLET_P2);
          }
        } else {
          // Fast dense spiral (12-way)
          spiralTimer -= dt;
          if (spiralTimer <= 0) {
            spiralTimer = 110;
            fireSpiral(12, BULLET_SPEED_FAST, COL_BULLET_P3);
          }
          // Aimed burst
          aimTimer -= dt;
          if (aimTimer <= 0) {
            aimTimer = 600;
            fireAimed(3, 0.2, BULLET_SPEED_FAST, COL_BULLET_P3);
          }
          // Ring burst
          ringTimer -= dt;
          if (ringTimer <= 0) {
            ringTimer = 3200;
            fireRing(24, BULLET_SPEED_MEDIUM, COL_BULLET_RING);
          }
          // Extra spread
          spreadTimer -= dt;
          if (spreadTimer <= 0) {
            spreadTimer = 800;
            fireAimed(7, 0.2, BULLET_SPEED_SLOW, COL_BULLET_P3);
          }
        }
      }

      // ── Move player bullets ───────────────────────────────────────────────
      for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        b.y += b.vy * (dt / 1000);
        b.display.y = b.y;

        // Off-screen
        if (b.y < -20) {
          removeBullet(playerBullets, i, playerBulletsContainer);
          continue;
        }

        // Hit enemy
        const dx = b.x - enemyEntity.position.x;
        const dy = b.y - enemyEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_HITBOX_R + PLAYER_BULLET_R) {
          removeBullet(playerBullets, i, playerBulletsContainer);
          enemyHP = Math.max(0, enemyHP - 1);
          score += SCORE_PER_HIT;
          hitFlashTimer = 80;

          // Emit explosion particles
          core.events.emitSync('particle/emit', {
            config: {
              x: enemyEntity.position.x + (Math.random() - 0.5) * 30,
              y: enemyEntity.position.y + (Math.random() - 0.5) * 30,
              burst: true,
              burstCount: 8,
              speed: 90,
              speedVariance: 40,
              spread: 180,
              angle: 0,
              lifetime: 350,
              startAlpha: 1,
              endAlpha: 0,
              startScale: 1,
              endScale: 0,
              startColor: 0xff6600,
              endColor: 0xff0000,
              radius: 4,
            },
          });

          checkPhase();

          if (enemyHP <= 0) {
            score += SCORE_BONUS_WIN;
            endGame(true);
            return;
          }
        }
      }

      // ── Move enemy bullets ────────────────────────────────────────────────
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx * (dt / 1000);
        b.y += b.vy * (dt / 1000);
        b.display.x = b.x;
        b.display.y = b.y;

        // Off-screen
        if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
          removeBullet(enemyBullets, i, enemyBulletsContainer);
          continue;
        }

        // Skip collision if invincible
        if (invincibleMs > 0) continue;

        // Hit player
        const dx = b.x - playerEntity.position.x;
        const dy = b.y - playerEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_BULLET_R + PLAYER_HITBOX_R) {
          removeBullet(enemyBullets, i, enemyBulletsContainer);
          playerHP = Math.max(0, playerHP - 1);
          invincibleMs = INVINCIBLE_MS;

          // Screen flash red on hit
          flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff0000, alpha: 1 });
          flashOverlay.alpha = 0.4;
          // Fade it out over time via the flash timer
          phaseFlashTimer = Math.max(phaseFlashTimer, 300);

          // Hit particles around player
          core.events.emitSync('particle/emit', {
            config: {
              x: playerEntity.position.x,
              y: playerEntity.position.y,
              burst: true,
              burstCount: 12,
              speed: 120,
              speedVariance: 60,
              spread: 180,
              lifetime: 500,
              startAlpha: 1,
              endAlpha: 0,
              startScale: 1.2,
              endScale: 0,
              startColor: 0xffff00,
              endColor: 0xff8800,
              radius: 5,
            },
          });

          if (playerHP <= 0) {
            endGame(false);
            return;
          }
        }
      }

      updateHUD();
    }
  );

  // ── End game ────────────────────────────────────────────────────────────────
  async function endGame(won: boolean): Promise<void> {
    if (gameEnded) return;
    gameEnded = true;

    gameResult.won = won;
    gameResult.score = score;
    if (score > gameResult.highScore) gameResult.highScore = score;

    // Big explosion on enemy if won
    if (won) {
      for (let k = 0; k < 6; k++) {
        core.events.emitSync('particle/emit', {
          config: {
            x: enemyEntity.position.x + (Math.random() - 0.5) * 60,
            y: enemyEntity.position.y + (Math.random() - 0.5) * 60,
            burst: true,
            burstCount: 20,
            speed: 160,
            speedVariance: 80,
            spread: 180,
            lifetime: 700,
            startAlpha: 1,
            endAlpha: 0,
            startScale: 1.5,
            endScale: 0,
            startColor: 0xffdd00,
            endColor: 0xff0000,
            radius: 6,
          },
        });
      }
    }

    // Brief delay before switching scene
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    await core.events.emit('scene/load', { key: 'gameover' });
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('game');

    unsubUpdate();
    unsubTouchStart();
    unsubTouchMove();
    unsubTouchEnd();
    unsubPointerDown();
    unsubPointerMove();
    unsubPointerUp();

    // Destroy all bullets
    for (const b of playerBullets) {
      playerBulletsContainer.removeChild(b.display);
      b.display.destroy();
    }
    for (const b of enemyBullets) {
      enemyBulletsContainer.removeChild(b.display);
      b.display.destroy();
    }
    playerBullets.length = 0;
    enemyBullets.length = 0;

    // Destroy entities
    core.events.emitSync('entity/destroy', { id: 'player' });
    core.events.emitSync('entity/destroy', { id: 'enemy' });

    // Destroy world objects
    worldLayer.removeChild(stars, scrollA, scrollB, playerBulletsContainer, enemyBulletsContainer);
    stars.destroy({ children: true });
    scrollA.destroy({ children: true });
    scrollB.destroy({ children: true });
    playerBulletsContainer.destroy({ children: true });
    enemyBulletsContainer.destroy({ children: true });

    // Destroy UI
    uiLayer.removeChild(heartsContainer, hpBarContainer, bossLabel, scoreText, phaseText);
    heartsContainer.destroy({ children: true });
    hpBarContainer.destroy({ children: true });
    bossLabel.destroy();
    scoreText.destroy();
    phaseText.destroy();

    sysLayer.removeChild(flashOverlay);
    flashOverlay.destroy();
  };
}

// ─── Scene exit ───────────────────────────────────────────────────────────────
async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const GameScene: SceneDescriptor = {
  key: 'game',
  enter,
  exit,
};
