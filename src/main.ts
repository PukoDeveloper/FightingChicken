import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  createEngine,
  EntityManager,
  InputManager,
  TimerManager,
  ParticleManager,
  SceneManager,
  GameStateManager,
  TweenManager,
  SaveManager,
  LocalStorageSaveAdapter,
  AchievementPlugin,
  LightingPlugin,
  DebugPlugin,
} from '@inkshot/engine';
import { TitleScene } from './scenes/TitleScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { DevMenuScene } from './scenes/DevMenuScene';
import { EndlessBuffScene } from './scenes/EndlessBuffScene';
import { CostumeSelectScene } from './scenes/CostumeSelectScene';
import { GAME_W, GAME_H } from './constants';
import { initPersistence, loadProgress } from './game/persistence';
import { initAchievements } from './game/achievements';

async function main(): Promise<void> {
  const { core } = await createEngine({
    container: '#app',
    background: 0x000011,
    width: GAME_W,
    height: GAME_H,
    antialias: true,
    plugins: [
      new InputManager(),
      new EntityManager(),
      new TimerManager(),
      new ParticleManager(),
      new SceneManager(),
      new GameStateManager(),
      new TweenManager(),
      new SaveManager(),
      new LocalStorageSaveAdapter({ keyPrefix: 'fightingchicken:' }),
      new AchievementPlugin(),
      // Dynamic lighting: full ambient + point lights around player & enemy.
      new LightingPlugin({ ambientIntensity: 1.0, ambientColor: 0xffffff }),
      // Debug overlay (Backtick / F12 to toggle) — only bundled in dev mode.
      ...(import.meta.env.DEV ? [new DebugPlugin()] : []),
      {
        namespace: 'game-bootstrap',
        async init(c) {
          // ── Persist & load ──────────────────────────────────────────────────
          initPersistence(c);
          await loadProgress();

          // ── Achievements ────────────────────────────────────────────────────
          initAchievements(c);

          // ── Achievement notification overlay ────────────────────────────────
          // Lives on the persistent system layer so it appears on top of every
          // scene without being cleaned up on scene transitions.
          const { output: sysOut } = c.events.emitSync('renderer/layer', { name: 'system' });
          const sysLayer = sysOut.layer as Container;

          const ACH_W = 290;
          const ACH_H = 64;
          const achContainer = new Container();
          achContainer.alpha = 0;
          achContainer.x = (GAME_W - ACH_W) / 2;
          achContainer.y = 72;
          sysLayer.addChild(achContainer);

          const achBg = new Graphics();
          achBg
            .roundRect(0, 0, ACH_W, ACH_H, 12)
            .fill({ color: 0x0d2d1a, alpha: 0.94 });
          achBg
            .roundRect(0, 0, ACH_W, ACH_H, 12)
            .stroke({ color: 0x44ff88, width: 2 });
          achContainer.addChild(achBg);

          const achTitleText = new Text({
            text: '🏆 成就解鎖！',
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 13,
              fill: 0x44ff88,
              fontWeight: 'bold',
            }),
          });
          achTitleText.x = 12;
          achTitleText.y = 8;
          achContainer.addChild(achTitleText);

          const achNameText = new Text({
            text: '',
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 18,
              fill: 0xeeffee,
              fontWeight: 'bold',
            }),
          });
          achNameText.x = 12;
          achNameText.y = 27;
          achContainer.addChild(achNameText);

          let achHideTimer = 0;

          c.events.on(
            'game-bootstrap',
            'achievement/unlocked',
            ({ name }: { name: string }) => {
              achNameText.text = name;
              // Fade in
              c.events.emitSync('tween/kill', { target: achContainer as unknown as Record<string, unknown> });
              c.events.emitSync('tween/to', {
                target: achContainer as unknown as Record<string, unknown>,
                props: { alpha: 1 },
                duration: 300,
                ease: 'easeOutQuad',
              });
              // Auto-hide after 3.2 s
              clearTimeout(achHideTimer);
              achHideTimer = window.setTimeout(() => {
                c.events.emitSync('tween/to', {
                  target: achContainer as unknown as Record<string, unknown>,
                  props: { alpha: 0 },
                  duration: 500,
                  ease: 'easeInQuad',
                });
              }, 3200);
            },
          );

          // ── DPR & canvas scaling ────────────────────────────────────────────
          const dpr = window.devicePixelRatio || 1;
          c.app.renderer.resolution = dpr;

          const canvas = c.app.canvas as HTMLCanvasElement;
          function scaleCanvas(): void {
            const scaleX = window.innerWidth / GAME_W;
            const scaleY = window.innerHeight / GAME_H;
            const scale = Math.min(scaleX, scaleY);
            canvas.style.width  = `${GAME_W * scale}px`;
            canvas.style.height = `${GAME_H * scale}px`;
          }
          scaleCanvas();
          window.addEventListener('resize', scaleCanvas);

          c.events.on('game-bootstrap', 'core/destroy', () => {
            window.removeEventListener('resize', scaleCanvas);
            clearTimeout(achHideTimer);
            sysLayer.removeChild(achContainer);
            achContainer.destroy({ children: true });
          });

          // ── Camera origin ───────────────────────────────────────────────────
          c.events.emitSync('camera/move', { x: GAME_W / 2, y: GAME_H / 2 });

          // ── Register scenes ─────────────────────────────────────────────────
          c.events.emitSync('scene/register', { scene: TitleScene });
          c.events.emitSync('scene/register', { scene: LevelSelectScene });
          c.events.emitSync('scene/register', { scene: GameScene });
          c.events.emitSync('scene/register', { scene: GameOverScene });
          c.events.emitSync('scene/register', { scene: DevMenuScene });
          c.events.emitSync('scene/register', { scene: EndlessBuffScene });
          c.events.emitSync('scene/register', { scene: CostumeSelectScene });

          await c.events.emit('scene/load', { key: 'title' });
        },
      },
    ],
  });

  // Prevent context menu on long-press (mobile)
  const canvas = core.app.canvas as HTMLCanvasElement;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

main().catch(console.error);
